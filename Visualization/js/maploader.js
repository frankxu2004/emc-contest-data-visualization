var day = 0;
var grade = "大一";

var $slider = $('input[name="slider1"]');
var $selector = $('select[name="grade"]');
$slider.bind('change', function(e) {
    e.preventDefault();
    console.log(day);
    day = parseInt($(this).val());
    mapLoadedCallback(day, grade);
});

$selector.bind('change', function(e) {
    e.preventDefault();
    console.log(grade);
    grade = String($(this).val());
    mapLoadedCallback(day, grade);
});

function mapLoadedCallback(day, grade) {
    if(typeof(InfoBox)=="undefined"){
         $.getScript("/libs/js/infobox.js");
    }   
    console.log("Google Map loaded.");    
    var mapOption = {
        zoomControlOptions: {  
            style: google.maps.ZoomControlStyle.SMALL,  
        },  
        zoom: 16,
        center: new google.maps.LatLng(31.0224,121.436),
        mapTypeId: google.maps.MapTypeId.HYBRID //.ROADMAP 
    };
    var mainMap = new google.maps.Map(document.getElementById("map-canvas"),mapOption);    

    $.ajax({ 
        url: "http://127.0.0.1:5000/map/"+String(day)+"/"+String(grade),
        dataType:"json",
        success:ajaxCallback
    });

    function ajaxCallback(data)  {
         console.log("Data Loaded.");
         var arrdata=data.map;
         var infowindow = new InfoBox({
             content: ""
            ,disableAutoPan: false            
            ,pixelOffset: new google.maps.Size(-130, -200)
            ,zIndex: null
            ,closeBoxURL: ""
            ,isHidden: false
            ,pane: "floatPane"
            ,enableEventPropagation: false
        });      

        function addMarker(markerData){  
            var marker = new google.maps.Marker({
                position:(new google.maps.LatLng(Number(markerData.longitude)-0.002,Number(markerData.latitude)+0.0047)),
                map:mainMap,
                animation: google.maps.Animation.DROP,
                draggable:false,
                icon:'img/wifi_map.png'
            });           
            google.maps.event.addListener(marker, 'mouseover', function() { 
                var infoMap=[
                    ["位　置",markerData.location],
                    ["用户数",markerData.count],
                    ["请求数",markerData.requests],
                    ["总流量",(markerData.bytes/1024).toFixed(2)+" KB"]
                ];         
                var htmlStr="<div style='box-shadow: 5px 5px 8px #000;font-size:14px;border-radius:12px;background:rgba(255,255,255,0.7);padding:13px 60px 13px 25px;'><table>" 
                for (var idx in infoMap)
                {
                    htmlStr+=("<tr><td><b>"+infoMap[idx][0]+"</b></td><td>"+infoMap[idx][1]+"</td></tr>");
                }
                htmlStr+="</table></div>";
                infowindow.setContent(htmlStr);
                infowindow.open(mainMap,marker);               
            });
            google.maps.event.addListener(marker, 'mouseout', function() {
                infowindow.close();
            });
        }      

        var heatMapArr = [];
        for(var idx in arrdata) {
            addMarker(arrdata[idx]);
            if(arrdata[idx].count<=40) {
                heatMapArr.push({
                    location:new google.maps.LatLng(Number(arrdata[idx].longitude)-0.002,Number(arrdata[idx].latitude)+0.0047),
                    weight:Number(arrdata[idx].count)
                    });
                console.log('1');
            }
            else {
                    var wt;
                    if(arrdata[idx].count/40<=6){
                        wt=32;
                        console.log('2');
                    }
                    else {
                        wt=arrdata[idx].count/6;
                        console.log('3');
                    }
                    heatMapArr.push({
                        location:new google.maps.LatLng(Number(arrdata[idx].longitude)-0.002,Number(arrdata[idx].latitude)+0.0047),
                        weight:wt
                        });
                    for(var pt=1;pt<arrdata[idx].count/40&&pt<6;pt++) {
                        heatMapArr.push({
                        location:new google.maps.LatLng((Math.random()-0.5)*0.0002+Number(arrdata[idx].longitude)-0.002,(Math.random()-0.5)*0.0006+Number(arrdata[idx].latitude)+0.0047),
                        weight:wt
                        });
                    }
            }
        }

        var heatmap = new google.maps.visualization.HeatmapLayer({ data: (new google.maps.MVCArray(heatMapArr)) , radius: 70});
        heatmap.setMap(mainMap);
       

    } //ajax Callback END; 

} //mapLoadedCallback END;
if(typeof(google)=="undefined"||typeof(google.maps)=="undefined") {       
    $.getScript("http://ditu.google.cn/maps/api/js?sensor=false&libraries=visualization&callback=mapLoadedCallback");
}
else {
    mapLoadedCallback(day, grade);
}

//$.getScript("http://maps.googleapis.com/maps/api/js?key=AIzaSyDhW6Ubc6xc0T_DLECHK0_kQxkgodMfP6Q&sensor=false&callback=mapLoadedCallback");