	mapboxgl.accessToken = mapToken;

    // function viewportSize(x) {
    //     if (x.matches) {
    //         document.createElement("")
    //     }
    // }

    //original
        const map = new mapboxgl.Map({
        container: 'cluster-map',
        style: 'mapbox://styles/bajancode/ckrp5zaib258317w9zjutbcva',
        // prev version: mapbox://styles/mapbox/streets-v11
        center: [-59.5432, 13.1939],
        zoom: 10
        });

    // //mobile
    //     const mapMobile = new mapboxgl.Map({
    //         container: 'cluster-map',
    //         style: 'mapbox://styles/bajancode/ckrp5zaib258317w9zjutbcva',
    //         // prev version: mapbox://styles/mapbox/streets-v11
    //         center: [-59.5432, 13.1939],
    //         zoom: 9
    //         });

    map.addControl(new mapboxgl.NavigationControl());

    map.on('load', function () {
         map.addSource('playgrounds', {
            type: 'geojson',
            data: playgrounds,
            cluster: true,
            clusterMaxZoom: 14, 
            clusterRadius: 50 
        });

        map.addLayer({
            id: 'clusters',
            type: 'circle',
            source: 'playgrounds',
            filter: ['has', 'point_count'],
            paint: {
                // Use step expressions (https://docs.mapbox.com/mapbox-gl-js/style-spec/#expressions-step)
                // with three steps to implement three types of circles:
                //   * Blue, 20px circles when point count is less than 100
                //   * Yellow, 30px circles when point count is between 100 and 750
                //   * Pink, 40px circles when point count is greater than or equal to 750
                'circle-color': [
                    'step',
                    ['get', 'point_count'],
                    '#03A9F4',
                    30,
                    '#2196F3',
                    30,
                    '#3F51B5'
                ],
                'circle-radius': [
                    'step',
                    ['get', 'point_count'],
                    25, //pixel width
                    10, //step count
                    25,
                    30,
                    25
                ]
            }
        });

        map.addLayer({
            id: 'cluster-count',
            type: 'symbol',
            source: 'playgrounds',
            filter: ['has', 'point_count'],
            layout: {
                'text-field': '{point_count_abbreviated}',
                'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
                'text-size': 12
            }
        });

        map.addLayer({
            id: 'unclustered-point',
            type: 'circle',
            source: 'playgrounds',
            filter: ['!', ['has', 'point_count']],
            paint: {
                'circle-color': '#11b4da',
                'circle-radius': 5,
                'circle-stroke-width': 1,
                'circle-stroke-color': '#0580b9'
            }
        });

        // inspect a cluster on click
        map.on('click', 'clusters', function (e) {
            const features = map.queryRenderedFeatures(e.point, {
                layers: ['clusters']
            });
            const clusterId = features[0].properties.cluster_id;
            map.getSource('playgrounds').getClusterExpansionZoom(
                clusterId,
                function (err, zoom) {
                    if (err) return;

                    map.easeTo({
                        center: features[0].geometry.coordinates,
                        zoom: zoom
                    });
                }
            );
        });

        // When a click event occurs on a feature in
        // the unclustered-point layer, open a popup at
        // the location of the feature, with
        // description HTML from its properties.
        map.on('click', 'unclustered-point', function (e) {
            const {popUpMarkup} = e.features[0].properties;
            const coordinates = e.features[0].geometry.coordinates.slice();
            
            // Ensure that if the map is zoomed out such that
            // multiple copies of the feature are visible, the
            // popup appears over the copy being pointed to.
            while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
                coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
            }

            new mapboxgl.Popup()
                .setLngLat(coordinates)
                .setHTML( popUpMarkup )
                .addTo(map);
        });

        map.on('mouseenter', 'clusters', function () {
            map.getCanvas().style.cursor = 'pointer';
        });
        map.on('mouseleave', 'clusters', function () {
            map.getCanvas().style.cursor = '';
        });

    });


