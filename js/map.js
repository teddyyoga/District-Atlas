const styles = {
  unavailable: { color: '#a9b0a5', fillColor: '#76837b', fillOpacity: .34 },
  ready: { color: '#beddd0', fillColor: '#83b6a7', fillOpacity: .62 },
  started: { color: '#ffe499', fillColor: '#f2c252', fillOpacity: .73 },
  done: { color: '#a6ffe2', fillColor: '#95cc6a', fillOpacity: .8 },
  blank: { color: '#96b3cd', fillColor: '#263d58', fillOpacity: 0 },
  hint: { color: '#ffe499', fillColor: '#f2c252', fillOpacity: .68 },
};

function createMap(element) {
  const map = L.map(element, { zoomSnap: .25, minZoom: 2, maxZoom: 15, zoomControl: false }).setView([39, 35], 5);
  map.attributionControl.setPrefix(false);
  L.control.zoom({ position: 'bottomleft' }).addTo(map);
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let layer;
  let districtLayers = new Map();

  function show(data, style, onEachFeature, padding, animate, onReady) {
    map.stop();
    if (layer) layer.remove();
    layer = L.geoJSON(data, { style, onEachFeature, className: 'map-shape' }).addTo(map);
    const options = { padding: [padding, padding], duration: .48 };
    if (animate && !reduceMotion.matches) {
      if (onReady) map.once('moveend', onReady);
      map.flyToBounds(layer.getBounds(), options);
    } else {
      map.fitBounds(layer.getBounds(), { ...options, animate: false });
      onReady?.();
    }
  }

  return {
    refresh() { map.invalidateSize({ pan: false }); },
    showProvinces(data, status, choose, animate) {
      districtLayers.clear();
      show(data, feature => ({ ...styles[status(feature.properties)], weight: 1 }), (feature, path) => {
        const province = feature.properties;
        const label = document.createElement('span');
        label.textContent = province.name + (province.districtCount ? '' : ' · ' + translate('unavailable'));
        path.bindTooltip(label, { sticky: true });
        path.on('click', () => province.districtCount ? choose(province.id) : path.openTooltip());
      }, 26, animate);
    },
    showDistricts(data, onReady) {
      districtLayers = new Map();
      show(data, { ...styles.blank, weight: 1.2 }, (feature, path) => {
        districtLayers.set(feature.properties.id, path);
      }, 32, true, onReady);
    },
    paintDistrict(district, found, hinted, celebrate) {
      const path = districtLayers.get(district.id);
      path.setStyle(styles[found ? 'done' : hinted ? 'hint' : 'blank']);
      path.getElement()?.classList.toggle('hinted', hinted && !found);
      if (!found) {
        if (path.getTooltip()) path.unbindTooltip();
        return;
      }
      if (path.getTooltip()) return;
      const label = document.createElement('span');
      label.textContent = district.name;
      const anchor = turf.pointOnFeature(path.feature).geometry.coordinates;
      path.bindTooltip(label, { permanent: true, direction: 'center', className: 'district-name' })
        .openTooltip([anchor[1], anchor[0]]);
      if (celebrate) {
        const shape = path.getElement();
        shape?.classList.add('celebrate');
        setTimeout(() => shape?.classList.remove('celebrate'), 850);
      }
    },
  };
}
