mapboxgl.accessToken = mapToken;
 const map = new mapboxgl.Map({
 container: 'map', // container ID
 style: 'mapbox://styles/bajancode/ckrp5zaib258317w9zjutbcva',
//  style: 'mapbox://styles/mapbox/streets-v11', // style URL, streets https://docs.mapbox.com/mapbox-gl-js/example/setstyle/
 center: playground.geometry.coordinates, // starting position [lng, lat]
 zoom: 13 // starting zoom
});

map.addControl(new mapboxgl.NavigationControl());


new mapboxgl.Marker()
    .setLngLat(playground.geometry.coordinates)
    .setPopup(
        new mapboxgl.Popup({offset: 25})
        .setHTML(
            `<h3>${playground.title}</h3><p>${playground.location}</p>`
        )
    )
    .addTo(map)