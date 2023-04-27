/* global Chart, coreui */

/**
 * --------------------------------------------------------------------------
 * CoreUI Boostrap Admin Template (v4.2.2): main.js
 * Licensed under MIT (https://coreui.io/license)
 * --------------------------------------------------------------------------
 */

// Disable the on-canvas tooltip
const baseURL = 'https://api2.xo-dev.site';
const apiKey = 'api_key=JjTwpJa0v3NXrD6NR1aUNxyDbvXLO1Jx8JM31nUCF2H3R8nyZ0';
const today = new Date();
var startDate = '';
var endDate = '';
Chart.defaults.pointHitDetectionRadius = 1;
Chart.defaults.plugins.tooltip.enabled = false;
Chart.defaults.plugins.tooltip.mode = 'index';
Chart.defaults.plugins.tooltip.position = 'nearest';
Chart.defaults.plugins.tooltip.external = coreui.ChartJS.customTooltips;
Chart.defaults.defaultFontColor = '#646470';
init('S001');
async function init(sensor) {
  const response = await axios.get(`${baseURL}/data_info?${apiKey}`);
  const locationList = response.data.location_list;
  const sensorList = response.data.sensor_list.list;
  var locate;
  var monitors = [];
  for (let i = 0; i < sensorList.length; i++) {
    if (sensorList[i].sensor_id == sensor) {
      $('.current').text(sensorList[i].location_name);
      $('#sensorId').val(sensor);
      locate = sensorList[i].location_name;
      monitors = sensorList[i].monitor_list;
    }
  }
  monitoring(locate, monitors);
  kakaoMap(locate);
  weatherInfo(sensor);
  dustChart(sensor, today);
  trafficIO(new Date(new Date().setFullYear(new Date().getFullYear() - 1)), new Date());
  sortChart(sensor, new Date(new Date().setFullYear(new Date().getFullYear() - 1)), new Date());
  trafficMain(sensor, new Date(new Date().setFullYear(new Date().getFullYear() - 1)), new Date());
  $('.graph_li').click(function () {
    if (!$(this).hasClass('active')) {
      $('li.active').removeClass('active');
      $(this).addClass('active');
    }
  });
  $('#option_year').click(function () {
    startDate = new Date(new Date().setFullYear(new Date().getFullYear() - 1));
    endDate = new Date();
    $('.date-options').innerHTML = `${startDate}`;
    trafficIO(startDate, endDate);
    sortChart(sensor, startDate, endDate);
    trafficMain(sensor, startDate, endDate);
  });
  $('#option_day').click(function () {
    startDate = new Date();
    endDate = new Date();
    trafficIO(startDate, endDate);
    sortChart(sensor, startDate, endDate);
    trafficMain(sensor, startDate, endDate);
  });
  $('#option_month').click(function () {
    startDate = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    endDate = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0);
    trafficIO(startDate, endDate);
    sortChart(sensor, startDate, endDate);
    trafficMain(sensor, startDate, endDate);
  });
}
async function monitoring(locate, monitors) {
  var title = document.getElementById('myModalLabel');
  title.textContent = locate;
  var imgSrc = document.createElement('img');
  $("#monitoring").empty();
  $('#monitoring').append(imgSrc);
  $("#monitor-list").empty();
  for (let i = 0; i < monitors.length; i++) {
    if (i == 0) {
      $('#monitor-list').append("<li class='nav-item'><a class='nav-link  active' aria-current='page' href='#' data-value=" + `${i + 1}` + ">" + `${monitors[i]}` + "</a></li>");
      imgSrc.setAttribute('src', `http://192.168.0.51:8080/zm/cgi-bin/nph-zms?scale=100&width=320p&height=240px&mode=jpeg&maxfps=30&buffer=1000&&monitor=${i + 1}&user=admin&pass=hijacking1`);
    } else {
      $('#monitor-list').append("<li class='nav-item'><a class='nav-link ' aria-current='page' data-value=" + `${i + 1}` + ">" + `${monitors[i]}` + "</a></li>");
    }
  }
  $("#monitor-list a").on("click", function (e) {
    $("#monitor-list").find(".active").removeClass("active");
    $(this).addClass("active");
    imgSrc.setAttribute('src', `http://192.168.0.51:8080/zm/cgi-bin/nph-zms?scale=100&width=320p&height=240px&mode=jpeg&maxfps=30&buffer=1000&&monitor=${$(this).attr('data-value')}&user=admin&pass=hijacking1`);
  });
}
async function kakaoMap(locate) {
  const response = await axios.get(`${baseURL}/data_info?${apiKey}`);
  const locationList = response.data.location_list;
  const sensorList = response.data.sensor_list.list;
  var container = document.getElementById('map');
  var options = {
    center: new kakao.maps.LatLng(35.01735, 126.78957),
    level: 7
  };
  var monitors = sensorList[0].monitor_list;
  // 지도생성
  var map = new kakao.maps.Map(container, options);
  var imageSrc = 'dist/assets/img/traffic-light.png';
  var selectSrc = 'dist/assets/img/traffic-light-select.png';
  var imageSize = new kakao.maps.Size(45, 55);
  var markerImage = new kakao.maps.MarkerImage(imageSrc, imageSize);
  var selectImage = new kakao.maps.MarkerImage(selectSrc, imageSize);
  sensorList.forEach(function (data) {
    let marker = new kakao.maps.Marker({
      position: new kakao.maps.LatLng(data.latitude, data.longitude),
      title: data.location_name,
      image: markerImage,
      text: data.sensor_id,
      map: map
    });
    if (locate == marker.Gb) {
      selectedMarker = marker; // 클릭 마커 담을 변수
    }

    kakao.maps.event.addListener(marker, 'click', function () {
      // 클릭된 마커가 없고, click 마커가 클릭된 마커가 아니면
      if (!selectedMarker || selectedMarker !== marker) {
        $('#myModal').modal('show');
        $('#myModalLabel').text(marker.Gb);
        $('.current').text(marker.Gb);
        $('#sensorId').val(data.sensor_id);
        init(data.sensor_id);
        monitoring(marker.Gb, monitors);
      }
      $('#myModal').modal('show');

      // 클릭된 마커를 현재 클릭된 마커 객체로 설정합니다
      selectedMarker = marker;
    });
  });
}

// 차량종류 chart
async function sortChart(sensor, startDate, endDate) {
  try {
    const datas = [];
    const labels = [];
    var sensorId;
    if (sensor != undefined) {
      sensorId = $('#sensorId').val();
    }
    sensorId = sensor;
    const sortResponse = await axios.get(`${baseURL}/traffic_sort_data?${apiKey}&sensor_id=${sensorId}&start_date=${dateFormat(startDate)}&end_date=${dateFormat(endDate)}`);
    Object.entries(sortResponse.data).forEach(([key, value]) => {
      if (key != 'pedestrian' && key != 'total_count') {
        datas.push(value);
        labels.push(key);
      }
    });
    if (window.cardChart2 != undefined) {
      window.cardChart2.destroy();
    }
    window.cardChart2 = new Chart(document.getElementById('card-chart2'), {
      type: 'polarArea',
      data: {
        labels: labels,
        datasets: [{
          label: '차량 종류',
          backgroundColor: ['rgba(196,47,53,.55)', 'rgba(153,49,148,.55)', 'rgba(252,178,64,.55)', 'rgba(93,191,239,.55)', 'rgba(36,185,118,.55)', 'rgba(186,255,255,.55)'],
          pointBackgroundColor: coreui.Utils.getStyle('--cui-info'),
          data: datas
        }]
      },
      options: {
        responsive: false,
        plugins: {
          legend: {
            position: 'right'
          }
        }
      }
    });
  } catch (error) {
    console.error('Error fetching data:', error);
  }
}

// 미세먼지 chart
async function dustChart(sensor, today) {
  try {
    var sensorId;
    if (sensorId != undefined) {
      sensorId = $('#sensorId').val();
    }
    sensorId = sensor;
    const hour = today.getHours();
    const fineArray = [];
    const ultraArray = [];
    const labelArray = [];
    for (let i = 0; i < hour; i++) {
      const hours = String(i).padStart(2, "0");
      const endHours = String(i + 1).padStart(2, "0");
      const avgResponse = await axios.get(`${baseURL}/sensor_summary_data?${apiKey}&sensor_id=${sensorId}&start_date=${dateFormat(today)}&end_date=${dateFormat(today)}&start_time=${hours}:00:00&end_time=${endHours}:00:00`);
      fineArray.push(avgResponse.data.dust_fine_dust_stats.avg_value);
      ultraArray.push(avgResponse.data.dust_ultra_fine_dust_stats.avg_value);
      labelArray.push(hours + '시');
    }
    const cardChart3 = new Chart(document.getElementById('card-chart3'), {
      type: 'line',
      data: {
        labels: labelArray,
        datasets: [{
          label: '미세먼지',
          backgroundColor: 'rgba(55,55,55,.2)',
          borderColor: 'rgba(55,55,55,.55)',
          data: fineArray,
          fill: true,
          tension: 0.4
        }, {
          label: '초미세먼지',
          backgroundColor: 'rgba(155,155,155,.2)',
          borderColor: 'rgba(155,155,155,.55)',
          data: ultraArray,
          fill: true,
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        plugins: {},
        interaction: {
          intersect: false
        },
        scales: {
          x: {
            display: true,
            title: {
              display: true
            }
          },
          y: {
            display: true,
            title: {
              display: true,
              text: '미세먼지 농도'
            }
          }
        }
      }
    });
  } catch (_unused2) {}
}

// 날짜 포매팅(yyyy-mm-dd)
function dateFormat(date) {
  let month = date.getMonth() + 1;
  let day = date.getDate();
  let hour = date.getHours();
  let minute = date.getMinutes();
  let second = date.getSeconds();
  month = month >= 10 ? month : '0' + month;
  day = day >= 10 ? day : '0' + day;
  hour = hour >= 10 ? hour : '0' + hour;
  minute = minute >= 10 ? minute : '0' + minute;
  second = second >= 10 ? second : '0' + second;
  return date.getFullYear() + '-' + month + '-' + day;
}

//차량 진출입 chart
async function trafficIO(startDate, endDate) {
  try {
    let labels = [];
    let inData = [];
    let outData = [];
    let now = new Date();
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    getLongMonthName = function (now) {
      return monthNames[now.getMonth()];
    };
    // 오늘(options = day)
    if (dateFormat(now) == dateFormat(startDate)) {
      const response = await axios.get(`${baseURL}/traffic_io_data?${apiKey}&Naju&start_date=${dateFormat(startDate)}&end_date=${dateFormat(startDate)}`);
      labels.push(dateFormat(now));
      inData.push(-response.data.in_count);
      outData.push(response.data.out_count);
    }
    // 이번달(options = month)
    else if (dateFormat(now) != dateFormat(endDate)) {
      const response = await axios.get(`${baseURL}/traffic_io_data?${apiKey}&Naju&start_date=${dateFormat(startDate)}&end_date=${dateFormat(endDate)}`);
      labels.push(getLongMonthName(now));
      // labels.push(dateFormat(now));
      inData.push(-response.data.in_count);
      outData.push(response.data.out_count);
    }
    // 1년(12개월 options = year)
    else {
      for (let i = startDate.getMonth() + 1; i <= startDate.getMonth() + 12; i++) {
        let date = new Date(startDate.getFullYear(), i, 1);
        let lastDate = new Date(startDate.getFullYear(), i + 1, 0);
        const response = await axios.get(`${baseURL}/traffic_io_data?${apiKey}&Naju&start_date=${dateFormat(date)}&end_date=${dateFormat(lastDate)}`);
        labels.push(getLongMonthName(date));
        inData.push(-response.data.in_count);
        outData.push(response.data.out_count);
      }
    }
    if (window.cardChart4 != undefined) {
      window.cardChart4.destroy();
    }
    window.cardChart4 = new Chart(document.getElementById('card-chart4'), {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: '진입',
          backgroundColor: 'rgba(0,135,68,.55)',
          borderColor: 'rgba(0,135,68,.55)',
          pointHoverBackgroundColor: '#fff',
          borderWidth: 2,
          data: inData,
          fill: true
        }, {
          label: '진출',
          backgroundColor: 'rgba(255,167,0,.55)',
          borderColor: 'rgba(255,167,0,.55)',
          pointHoverBackgroundColor: '#fff',
          borderWidth: 2,
          data: outData,
          fill: true
        }]
      },
      options: {
        indexAxis: 'y',
        // Elements options apply to all of the options unless overridden in a dataset
        // In this case, we are setting the border of each horizontal bar to be 2px wide
        elements: {
          bar: {
            borderWidth: 2
          }
        },
        responsive: true,
        plugins: {
          legend: {
            position: 'right'
          }
        }
      }
    });
  } catch (error) {
    console.error('Error fetching data:', error);
  }
}

// Traffic 차트
async function trafficMain(sensor, startDate, endDate) {
  try {
    var sensorId;
    if (sensor != undefined) {
      sensorId = $('sensorId').val();
    }
    sensorId = sensor;
    let now = new Date();
    let labels = [];
    let pedestrian = [];
    let car = [];
    let agricultural = [];
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    getLongMonthName = function (date) {
      return monthNames[date.getMonth()];
    };
    var searchData = new Array();
    // 오늘(options = day)
    if (dateFormat(now) == dateFormat(startDate)) {
      for (let i = now.getHours(); i >= 0; i--) {
        var hours;
        if (i < 10) {
          hours = `0${i}`;
        }
        hours = i;
        const response = await axios.get(`${baseURL}/traffic_sort_data?${apiKey}&sensor_id=${sensorId}&start_date=${dateFormat(startDate)}&end_date=${dateFormat(endDate)}&start_time=${hours}:00:00&end_time=${now.getHours()}:00:00`);
        searchData.push(response.data);
        labels.push(hours + '시');
      }
      const newSearchData = searchData.map(m => ({
        pedestrian: m.pedestrian,
        carSum: m.car_small + m.car_medium + m.car_large,
        agricultural: m.agricultural_machinery
      }));
      for (let obj of newSearchData) {
        pedestrian.push(obj.pedestrian);
        car.push(obj.carSum);
        agricultural.push(obj.agricultural);
      }
    }
    // 이번달(options = month)
    else if (dateFormat(now) != dateFormat(endDate)) {
      var searchData = new Array();
      for (let i = 1; i <= now.getDate(); i++) {
        let lastDate = new Date(now.getFullYear(), now.getMonth(), i);
        const response = await axios.get(`${baseURL}/traffic_sort_data?${apiKey}&sensor_id=${sensorId}&start_date=${dateFormat(startDate)}&end_date=${dateFormat(lastDate)}`);
        searchData.push(response.data);
        labels.push(dateFormat(lastDate));
      }
      const newSearchData = searchData.map(m => ({
        pedestrian: m.pedestrian,
        carSum: m.car_small + m.car_medium + m.car_large,
        agricultural: m.agricultural_machinery
      }));
      for (let obj of newSearchData) {
        pedestrian.push(obj.pedestrian);
        car.push(obj.carSum);
        agricultural.push(obj.agricultural);
      }
    }
    // 1년(12개월 options = year)
    else {
      var searchData = new Array();
      for (let i = startDate.getMonth() + 1; i <= startDate.getMonth() + 12; i++) {
        let date = new Date(startDate.getFullYear(), i, 1);
        let lastDate = new Date(startDate.getFullYear(), i + 1, 0);
        const response = await axios.get(`${baseURL}/traffic_sort_data?${apiKey}&sensor_id=${sensorId}&start_date=${dateFormat(startDate)}&end_date=${dateFormat(lastDate)}`);
        searchData.push(response.data);
        labels.push(getLongMonthName(date));
      }
      const newSearchData = searchData.map(m => ({
        pedestrian: m.pedestrian,
        carSum: m.car_small + m.car_medium + m.car_large,
        agricultural: m.agricultural_machinery
      }));
      for (let obj of newSearchData) {
        pedestrian.push(obj.pedestrian);
        car.push(obj.carSum);
        agricultural.push(obj.agricultural);
      }
    }
    if (window.mainChart != undefined) {
      window.mainChart.destroy();
    }
    window.mainChart = new Chart(document.getElementById('main-chart'), {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: '보행자',
          backgroundColor: coreui.Utils.hexToRgba(coreui.Utils.getStyle('--cui-info'), 10),
          borderColor: coreui.Utils.getStyle('--cui-warning'),
          pointHoverBackgroundColor: '#fff',
          borderWidth: 2,
          data: pedestrian,
          fill: true
        }, {
          label: '차량',
          borderColor: coreui.Utils.getStyle('--cui-success'),
          pointHoverBackgroundColor: '#fff',
          borderWidth: 2,
          data: car
        }, {
          label: '경운기',
          borderColor: coreui.Utils.getStyle('--cui-danger'),
          pointHoverBackgroundColor: '#fff',
          borderWidth: 1,
          borderDash: [8, 5],
          data: agricultural
        }]
      },
      options: {
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          }
        },
        scales: {
          x: {
            grid: {
              drawOnChartArea: false
            }
          },
          y: {
            ticks: {
              beginAtZero: true,
              maxTicksLimit: 5,
              stepSize: Math.ceil(250 / 5),
              max: 250
            }
          }
        },
        elements: {
          line: {
            tension: 0.4
          },
          point: {
            radius: 0,
            hitRadius: 10,
            hoverRadius: 4,
            hoverBorderWidth: 3
          }
        }
      }
    });
  } catch (_unused) {}
}

/* 날씨정보 */
async function weatherInfo(sensor) {
  var sensorId;
  if (sensor != undefined) {
    sensorId = $('#sensorId').val();
  }
  sensorId = sensor;
  const weatherResponse = await axios.get(`${baseURL}/sensor_latest_data?${apiKey}&sensor_id=${sensorId}`);
  const temperature = Math.round(weatherResponse.data.temperature_humidity[0].temperature);
  const humidity = Math.round(weatherResponse.data.temperature_humidity[0].humidity);
  const windspeed = Math.round(weatherResponse.data.wind[0].speed);
  const luminance = Math.floor(weatherResponse.data.luminance[0].luminance * 100);
  let weather = document.querySelectorAll('.weather-info');
  weather[0].innerHTML = `${temperature}℃`;
  weather[1].innerHTML = `${humidity}%`;
  weather[2].innerHTML = `${windspeed}m/s`;
  weather[3].innerHTML = `${luminance}Lux`;
  var weatherSum = 0;
  if (temperature < 20) {
    weatherSum += 100;
  } else {
    weatherSum += 200;
  }
  if (humidity < 30) {
    weatherSum += 10;
  } else if (30 <= humidity < 60) {
    weatherSum += 20;
  } else if (humidity >= 60) {
    weatherSum += 30;
  }
  if (windspeed < 10) {
    weatherSum += 1;
  } else if (10 <= windspeed < 20) {
    weatherSum += 2;
  } else if (windspeed >= 20) {
    weatherSum += 3;
  }
  var temp = document.createElement('img');
  $('#temperature').prepend(temp);
  switch (weatherSum) {
    case (111, 112, 211, 212):
      temp.setAttribute('src', '../assets/img/weather/sunny.png');
      temp.setAttribute('width', '80px');
      break;
    case (121, 122, 123, 221, 222, 223):
      temp.setAttribute('src', '../assets/img/weather/clear-sky.png');
      temp.setAttribute('width', '80px');
      break;
    case (131, 132, 133, 231, 232, 233):
      temp.setAttribute('src', '../assets/img/weather/downpour.png');
      temp.setAttribute('width', '80px');
      break;
  }
}

/* 블랙박스 리스트 최근 5개  */

let recordData = [];
$(function () {
  const recordUrl = "http://192.168.0.51:8080/zm/api/events.json?sort=StartTime&direction=desc&limit=5&user=admin&pass=hijacking1";
  axios.get(recordUrl).then(res => {
    recordData = res.data.events;
    let recordHtml = '';
    for (let i = 0; i < recordData.length; i++) {
      let category = recordData[i].Event.Name.split("-")[0];
      let dtArray = recordData[i].Event.StartTime.split(" ");
      let evnetId = recordData[i].Event.Id;
      let dateSplit = dtArray[0].split("-");
      let timeSplit = dtArray[1].split(":");
      let titleName = dateSplit.join("") + "_" + timeSplit.join("") + "_record";
      let byte = Math.floor(recordData[i].Event.DiskSpace / 1024);
      recordHtml += '<tr class="modalVideo" data-bs-toggle="modal" data-bs-target="#videoModal" data-value="' + evnetId + '">';
      recordHtml += '  <td class="text-center">' + category + '</td>';
      recordHtml += '  <td class="title-name">' + titleName + evnetId + '</td>';
      recordHtml += '  <td class="text-center">' + dtArray[0] + '</td>';
      recordHtml += '  <td class="text-center">' + dtArray[1] + '</td>';
      recordHtml += '  <td class="text-center">' + byte + " Kbyte" + '</td>';
      recordHtml += '</tr>';
    }
    $('#record_table').append(recordHtml);
    let modalOpen = document.querySelectorAll('tr.modalVideo');
    modalOpen.forEach(function (item) {
      item.addEventListener('click', function () {
        let titles = document.getElementById('myModalLabel');
        titles.innerHTML = item.children[1].textContent;
        let eventId = item.getAttribute('data-value');
        var imgSrc = document.createElement('img');
        $('#monitor-list').empty();
        $('#monitoring').empty();
        imgSrc.setAttribute('src', `http://192.168.0.51:8080/zm/cgi-bin/nph-zms?mode=jpeg&frame=1&replay=none&source=event&event=${eventId}&connkey=${eventId}&user=admin&pass=hijacking1`);
        $('#monitoring').append(imgSrc);
        $('#myModal').modal('show');
      });
    });
  });
});
//# sourceMappingURL=main.js.map