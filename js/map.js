const styles = {
  unavailable: { color: '#a9b0a5', fillColor: '#76837b', fillOpacity: .34 },
  ready: { color: '#beddd0', fillColor: '#83b6a7', fillOpacity: .62 },
  started: { color: '#ffe499', fillColor: '#f2c252', fillOpacity: .73 },
  done: { color: '#a6ffe2', fillColor: '#95cc6a', fillOpacity: .8 },
  blank: { color: '#96b3cd', fillColor: '#263d58', fillOpacity: 0 },
  missed: { color: '#f3ae99', fillColor: '#b95248', fillOpacity: .72 },
  skipped: { color: '#9ca9a5', fillColor: '#65706d', fillOpacity: .82 },
  revealed: { color: '#ffe4ab', fillColor: '#e4a54c', fillOpacity: .7 },
  hint: { color: '#ffe499', fillColor: '#f2c252', fillOpacity: .68 },
};

function createMap(element) {
  const map = L.map(element, { zoomSnap: .25, minZoom: 2, maxZoom: 15, maxBoundsViscosity: 1, zoomControl: false }).setView([39, 35], 5);
  map.attributionControl.setPrefix(false);
  L.control.zoom({ position: 'bottomleft' }).addTo(map);
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let layer;
  let pendingView;
  let districtLayers = new Map();

  function show(data, style, onEachFeature, padding, animate, onReady) {
    if (pendingView) map.off('moveend', pendingView);
    map.stop();
    map.setMaxBounds(null);
    if (layer) layer.remove();
    layer = L.geoJSON(data, { style, onEachFeature, className: 'map-shape' }).addTo(map);
    const bounds = layer.getBounds();
    const dragBounds = bounds.pad(.12);
    const options = { padding: [padding, padding], duration: .48 };

    function settleView() {
      pendingView = null;
      map.setMaxBounds(dragBounds);
      onReady?.();
    }

    if (animate && !reduceMotion.matches) {
      pendingView = settleView;
      map.once('moveend', pendingView);
      map.flyToBounds(bounds, options);
    } else {
      map.fitBounds(bounds, { ...options, animate: false });
      settleView();
    }
  }

  return {
    refresh() { map.invalidateSize({ pan: false }); },
    showProvinces(data, status, choose, animate) {
      districtLayers.clear();
      show(data, feature => ({ ...styles[status(feature.properties)], weight: 1 }), (feature, path) => {
        const province = feature.properties;
        path.options.className += ' province-shape';
        path.on('mouseover', () => path.bringToFront());
        const label = document.createElement('span');
        label.textContent = province.name + (province.districtCount ? '' : ' · ' + translate('unavailable'));
        path.bindTooltip(label, { sticky: true, className: 'province-name', opacity: 1 });
        path.on('click', () => province.districtCount ? choose(province.id) : path.openTooltip());
      }, 26, animate);
    },
    showDistricts(data, onReady, chooseDistrict) {
      districtLayers = new Map();
      show(data, { ...styles.blank, weight: 1.2 }, (feature, path) => {
        const id = feature.properties.id;
        districtLayers.set(id, path);
        if (!chooseDistrict) return;
        path.options.className += ' district-choice';
        path.on('click', () => chooseDistrict(id));
        const choiceNumber = districtLayers.size;
        path.on('add', () => {
          const shape = path.getElement();
          shape.setAttribute('tabindex', '0');
          shape.setAttribute('role', 'button');
          shape.setAttribute('aria-label', translate('districtChoice', choiceNumber));
          shape.addEventListener('keydown', event => {
            if (event.key !== 'Enter' && event.key !== ' ') return;
            event.preventDefault();
            event.stopPropagation();
            chooseDistrict(id);
          });
        });
      }, 32, true, onReady);
    },
    paintDistrict(district, found, hinted, celebrate, marked) {
      const path = districtLayers.get(district.id);
      path.setStyle(styles[marked ?? (found ? 'done' : hinted ? 'hint' : 'blank')]);
      const shape = path.getElement();
      shape?.classList.toggle('hinted', hinted && !found);
      const skipped = marked === 'skipped';
      const unavailable = skipped || marked === 'revealed';
      if (shape?.classList.contains('district-choice')) {
        shape.classList.toggle('district-unavailable', unavailable);
        shape.setAttribute('tabindex', unavailable ? '-1' : '0');
        shape.setAttribute('aria-disabled', String(unavailable));
      }
      if (!found && !skipped) {
        if (path.getTooltip()) path.unbindTooltip();
        return;
      }
      if (path.getTooltip()) return;
      const label = document.createElement('span');
      label.textContent = district.name;
      const anchor = turf.pointOnFeature(path.feature).geometry.coordinates;
      const className = skipped ? 'district-name skipped-name' : 'district-name';
      path.bindTooltip(label, { permanent: true, direction: 'center', className })
        .openTooltip([anchor[1], anchor[0]]);
      if (celebrate) {
        shape?.classList.add('celebrate');
        setTimeout(() => shape?.classList.remove('celebrate'), 850);
      }
    },
  };
}
