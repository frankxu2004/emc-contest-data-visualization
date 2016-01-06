function overviewCtr($scope, $http) {
    Highcharts.setOptions({global: {useUTC: true}});
    $scope.chartConfig = {
        options: {
            chart: {
                type: 'spline',
                zoomType: 'xy'
            },
            tooltip: {
                formatter: function () {
                    return '<b>' + this.series.name + '</b><br/>时间 : ' + Highcharts.dateFormat('%H:%M:%S', new Date(this.x * 1000)) + '   值 : ' + this.y;
                }
            }
        },
        title: {},
        xAxis: {
            labels: {
                formatter: function () {
                    return Highcharts.dateFormat('%H:%M', new Date(this.value * 1000))
                }
            }
        },
        yAxis: {
            title: {}
        },
        series: [{name: '平均', data: []}]
    };
    $http.get('/emc/data/avgday.json').success(function (data) {

        if (typeof(data) == "undefined")
            return;
        $scope.ajaxHistoryData = {average: []};
        for (var item in data) {
            var time = Number(data[item].time);
            $scope.ajaxHistoryData.average.push([time, {
                'flow': Number(data[item].flow),
                'count': Number(data[item].count),
                'requests': Number(data[item].requests)
            }]);
        }
        $scope.switchChart(0);
    });

    $scope.switchChart = function (p) {
        if (typeof($scope.ajaxHistoryData) == "undefined")
            return;
        var textMap = ["人数", "流量", "请求"];
        var nameMap = ["count", "flow", "requests"];

        function chartDataAdapter(dataObject, proName) {
            var res = [];
            for (var item in dataObject) {
                res.unshift({
                    x: dataObject[item][0] * 3600,
                    y: Number(dataObject[item][1][proName])
                });
            }
            return res;
        }

        $scope.chartMode = p;
        $scope.chartConfig.title.text = "平均" + textMap[p];
        $scope.chartConfig.yAxis.title.text = textMap[p];
        $scope.chartConfig.series[0].data = chartDataAdapter($scope.ajaxHistoryData.average, nameMap[p]);
    }

}

function mapviewCtr($scope) {
    $.getScript("/emc/js/maploader.js");
}
function detailCtr($scope, $routeParams, $http) {
    Highcharts.setOptions({global: {useUTC: false}});
    switch ($routeParams.id) {
        case "library":
            $scope.PageTitle = "图书馆 详细信息";
            $http.get('/emc/data/detail_library.json').success(ajaxCallback);
            $http.get('/emc/data/history_library.json').success(historyCallback);
            break;
        case "cafeteria":
            $scope.PageTitle = "食堂 详细信息";
            $http.get('/emc/data/detail_cafeteria.json').success(ajaxCallback);
            $http.get('/emc/data/history_cafeteria.json').success(historyCallback);
            break;
        case "classroom":
            $scope.PageTitle = "教室 详细信息";
            $http.get('/emc/data/detail_classroom.json').success(ajaxCallback);
            $http.get('/emc/data/history_classroom.json').success(historyCallback);
            break;
        default:
            $scope.PageTitle = "详细信息";
    }
    $scope.chartConfig = {
        options: {
            chart: {
                type: 'area',
                zoomType: 'xy'
            },
            plotOptions: {
                area: {
                    stacking: 'normal',
                    lineColor: '#666666',
                    lineWidth: 1,
                    marker: {
                        enabled: false
                    }
                }
            },
            tooltip: {

                shared: true,
                valueSuffix: ''
            }
        },
        title: {
            text: ''
        },
        xAxis: {
            labels: {
                formatter: function () {
                    return Highcharts.dateFormat('%H:%M', new Date((this.value-8) * 3600 * 1000))
                }
            },
            title: {
                text: '时间'
            }
        },
        yAxis: {
            title: {
                text: ''
            }
        },
        series: [],
        credits: {
            enabled: false
        }
    };


    function ajaxCallback(data) {
        $scope.detailData = data;
        $scope.row = {user: "用户", flow: "流量", request: "请求"};
        var slaveChartData = [];
        for (var i in $scope.detailData) {
            slaveChartData.push([$scope.detailData[i].location, $scope.detailData[i].count - 0]);
        }
        $scope.slave_chartConfig = {
            title: {
                text: '用户分布'
            },
            tooltip: {
                pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
            },
            plotOptions: {
                pie: {
                    allowPointSelect: true,
                    cursor: 'pointer',
                    dataLabels: {
                        enabled: true,
                        color: '#000000',
                        connectorColor: '#000000',
                        format: '<b>{point.name}</b>: {point.percentage:.1f} %'
                    }
                }
            },
            credits: {
                enabled: false
            },
            series: [{
                data: slaveChartData,
                type: 'pie',
                name: '用户人数'
            }]
        };
    } //ajaxCallback END

    function historyCallback(data) {
        var his_data = data;

        if (typeof(his_data) == "undefined")
            return;
        var tmpHistoryObj = {count: {}, requests: {}, bytes: {}};
        for (var item in his_data) {
            if (typeof(his_data[item].time) == "undefined")
                continue;
            var time = Number(his_data[item].time);
            if (tmpHistoryObj.count[his_data[item].location] == undefined)
                tmpHistoryObj.count[his_data[item].location] = [];
            tmpHistoryObj.count[his_data[item].location].unshift({
                x: time,
                y: Number(his_data[item].count)
            });
        }
        for (var item in his_data) {
            if (typeof(his_data[item].time) == "undefined")
                continue;
            var time = Number(his_data[item].time);
            if (tmpHistoryObj.requests[his_data[item].location] == undefined)
                tmpHistoryObj.requests[his_data[item].location] = [];
            tmpHistoryObj.requests[his_data[item].location].unshift({
                x: time,
                y: Number(his_data[item].requests)
            });
        }
        for (var item in his_data) {
            if (typeof(his_data[item].time) == "undefined")
                continue;
            var time = Number(his_data[item].time);
            if (tmpHistoryObj.bytes[his_data[item].location] == undefined)
                tmpHistoryObj.bytes[his_data[item].location] = [];
            tmpHistoryObj.bytes[his_data[item].location].unshift({
                x: time,
                y: Number(his_data[item].bytes)
            });
        }
        $scope.chartData = {count: [], requests: [], bytes: []};
        for (var name in tmpHistoryObj.count) {
            if (tmpHistoryObj.count.hasOwnProperty(name)) {
                $scope.chartData.count.push({"name": name, "data": tmpHistoryObj.count[name]});
            }
        }
        for (var name in tmpHistoryObj.requests) {
            if (tmpHistoryObj.requests.hasOwnProperty(name)) {
                $scope.chartData.requests.push({"name": name, "data": tmpHistoryObj.requests[name]});
            }
        }
        for (var name in tmpHistoryObj.bytes) {
            if (tmpHistoryObj.bytes.hasOwnProperty(name)) {
                $scope.chartData.bytes.push({"name": name, "data": tmpHistoryObj.bytes[name]});
            }
        }
        $scope.switchChart = function (p) {
            $scope.chartMode = p;
            if (p == 0) {
                $scope.chartConfig.series = $scope.chartData.count;
                $scope.chartConfig.title.text = "平均人数变化趋势";
                $scope.chartConfig.yAxis.title.text = "平均人数";
                $scope.chartConfig.options.tooltip.valueSuffix = " 人";
            }
            else if (p == 1) {
                $scope.chartConfig.series = $scope.chartData.requests;
                $scope.chartConfig.title.text = "平均请求数变化趋势";
                $scope.chartConfig.yAxis.title.text = "平均请求数";
                $scope.chartConfig.options.tooltip.valueSuffix = " 次";
            }
            else {
                $scope.chartConfig.series = $scope.chartData.bytes;
                $scope.chartConfig.title.text = "平均流量变化趋势";
                $scope.chartConfig.yAxis.title.text = "平均流量";
                $scope.chartConfig.options.tooltip.valueSuffix = " Bytes";
            }
        };
        $scope.switchChart(0);
    }
}

function similarCtr($scope, $http) {
    $scope.findSimilar = function(user_id) {
        $http.get('http://maview.us/emc/api/similar/'+String(user_id)).success(function (data) {
            if (typeof(data) == "undefined")
                return;
            $scope.result = data;
        });
    };
}

function scoreCtr($scope, $http) {
    $scope.chartConfig = {
        options: {
            chart: {
                type: 'spline',
                zoomType: 'xy'
            },
            tooltip: {
            }
        },
        title: {
            text:"学霸指数成长变化"
        },
        xAxis: {
            labels: {

            }
        },
        yAxis: {
            title: {}
        },
        series: [{name: '学霸指数', data: []}]
    };
    $scope.getScore = function(user_id) {
        $http.get('http://maview.us/emc/api/score/'+String(user_id)).success(function (data) {
            if (typeof(data) == "undefined")
                return;
            $scope.result = {};
            $scope.result.score = String((Number(data.score)*100).toFixed(1)) + " %";
        });
    };
    $scope.result = {score: "0.0 %"};
}