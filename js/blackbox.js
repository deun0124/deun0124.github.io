let getTotalpage;
let eventData = [];
let eventArray = [];
let checkarray =[];
let sumarray=[];
const countPerPage = 13; // 페이지당 데이터 건수
const showPageCnt = 5; // 화면에 보일 페이지 번호 개수

chk()
async function chk(){
  const response =  await axios.get('http://192.168.0.51:8080/zm/api/events/index.json?user=admin&pass=hijacking1');
  console.log(response.data.pagination.pageCount)
  for(let i=1; i<=response.data.pagination.pageCount; i++){
    const pageResponse = await axios.get(`http://192.168.0.51:8080/zm/api/events.json?page=${i}&user=admin&pass=hijacking1`)
    checkarray.push(pageResponse.data.events);
  }
  eventData = (checkarray.flat()).reverse();
   // 데이터를 한 번에 가져와서 페이지별로 화면에 출력합니다.
   setTable(1);
   setPaging(1);
   $(document).on('click', 'ul.pagination>li.page-item', function () {
    if (!$(this).hasClass('active')) {
      $(this).parent().find('li.active').removeClass('active');
      $(this).addClass('active');
      setTable(Number($(this).text()));
    }
  });
  $(document).on('click', 'ul.pagination>li.move', function () {
    const totalPage = Math.floor(eventData.length / countPerPage) + (eventData.length % countPerPage == 0 ? 0 : 1);
    const id = $(this).attr('id');
    if (id == 'first_page') {
      setTable(1);
      setPaging(1);
    } else if (id == 'prev_page') {
      let arrPages = [];
      $('ul.pagination>li.pages').each(function (idx, item) {
        arrPages.push(Number($(this).text()));
        console.log(idx,item)
      });

       const prevPage = Math.min(...arrPages) - showPageCnt;
      setTable(prevPage);
      setPaging(prevPage);  
    } else if (id == 'next_page') {
      let arrPages = [];
      $('ul.pagination>li.pages').each(function (idx, item) {
        arrPages.push(Number($(this).text()));
      });
       const nextPage =Math.max(...arrPages) + 1;
      setTable(nextPage); 
      setPaging(nextPage);
    } else if (id == 'last_page') {
      const lastPage = Math.floor((totalPage - 1) / showPageCnt) * showPageCnt + 1;
      setTable(lastPage);
      setPaging(lastPage);
    }
  });
}



/**
 * 테이블에 데이터를 세팅합니다.
*/
function setTable(pageNum) {
  $('#table_body').empty();
  
  // filtering data
  const filteredData = eventData.slice((pageNum - 1) * countPerPage, pageNum * countPerPage);
  // let fileName = 

  let sTbodyHtml = '';
  for (let i = 0; i < filteredData.length; i++) {
    let category = filteredData[i].Event.Name.split("-")[0];
    let dtArray = filteredData[i].Event.StartTime.split(" ");
    let evnetId = filteredData[i].Event.Id;
    let dateSplit = dtArray[0].split("-");
    let timeSplit = dtArray[1].split(":");
    let titleName = dateSplit.join("") + "_" + timeSplit.join("") + "_record";
    let byte = Math.floor(filteredData[i].Event.DiskSpace / 1024);
    sTbodyHtml += '<tr class="modalVideo" data-bs-toggle="modal" data-bs-target="#videoModal" data-value="' + evnetId + '">';
    sTbodyHtml += '  <td class="text-center">' + category + '</td>';
    sTbodyHtml += '  <td class="title-name">' + titleName + evnetId + '</td>';
    sTbodyHtml += '  <td class="text-center">' + dtArray[0] + '</td>';
    sTbodyHtml += '  <td class="text-center">' + dtArray[1] + '</td>';
    sTbodyHtml += '  <td class="text-center">' + byte + " Kbyte" + '</td>';
    sTbodyHtml += '</tr>';
  }
  $('#table_body').append(sTbodyHtml);
  let modalOpen = document.querySelectorAll('tr.modalVideo');
  modalOpen.forEach(function (item) {
    item.addEventListener('click', function () {
      let titles = document.getElementById('videoModalLabel');
      titles.innerText = item.children[1].textContent;
      let eventId = item.getAttribute('data-value');
      var imgSrc = document.createElement('img');
      $('#recording').empty();
      imgSrc.setAttribute('src', `http://192.168.0.51:8080/zm/cgi-bin/nph-zms?mode=jpeg&frame=1&replay=none&source=event&event=${eventId}&connkey=${eventId}&user=admin&pass=hijacking1`);
      $('#recording').append(imgSrc);
      $('#videoModal').modal('show');
    });

  });
}

/**
 * 페이징 정보를 세팅합니다.
 * @param {int} pageNum - Page Number
 */
function setPaging(pageNum) {
  const currentPage = pageNum;
  const totalPage = Math.floor(eventData.length / countPerPage) + (eventData.length % countPerPage == 0 ? 0 : 1);
  console.log(currentPage, totalPage, showPageCnt);

  showAllIcon();
  if (currentPage <= showPageCnt) {
    $('#first_page').hide();
    $('#prev_page').hide();
  }
  if (totalPage <= showPageCnt || Math.floor((currentPage - 1) / showPageCnt) * showPageCnt + showPageCnt + 1 > totalPage) {
    $('#next_page').hide();
    $('#last_page').hide();
  }
  let start = Math.floor((currentPage - 1) / showPageCnt) * showPageCnt + 1;
  let sPagesHtml = '';
  for (const end = start + showPageCnt; start < end && start <= totalPage; start++) {
    sPagesHtml += '<li class="page-item pages ' + (start == currentPage ? 'active' : '') + '">' + '<a class="page-link">' + start + '</a></li>';
  }
  $('li.page-item.pages').empty();
  $('#prev_page').after(sPagesHtml);
}
function showAllIcon() {
  $('#first_page').show();
  $('#prev_page').show();
  $('#next_page').show();
  $('#last_page').show();
}
//# sourceMappingURL=blackbox.js.map