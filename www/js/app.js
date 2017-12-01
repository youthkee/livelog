function $(id){return document.getElementById(id);}

ons.ready(function() {
  console.log("Onsen UI is ready!");

  //☆localStorageにデータが登録されていたらサイドバーにメニューを表示する処理
  if(localStorage.length > 0) {

    //localStorageのKey-Valueを格納するための配列を生成
    var key = new Array();
    var allItem = new Array();

    for(var i=0; i<localStorage.length; i++) {
      //localStorageのKey-Value値を各配列に代入
      key[i] = localStorage.key(i);
      allItem[i] = JSON.parse(
        localStorage.getItem(key[i])
      );
    }

    //allItemにdateとopen/startを繋げた日時の項目を追加
    for (item in allItem) {
      allItem[item].dateOpen = allItem[item].date + ' ' + allItem[item].open;
      allItem[item].dateStart = allItem[item].date + ' ' + allItem[item].start;
    }

    //open日時を第1キー、start日時を第2キーとしてallItemを降順にソート
    ObjArraySort2(allItem, 'dateOpen', 'desc', 'dateStart', 'desc');

    //localStorageに登録されている全ての年を格納する配列を生成
    var allYearList = new Array();

    //日時のうち年（YYYY）の部分だけ切り出してallYearListに格納
    for(var i=0; i<allItem.length; i++) {
      var dateString = allItem[i].date;
      var yearString = dateString.slice(0, 4);
      allYearList[i] = yearString;
    }

    //allYearListから重複分を除いてユニークな年の一覧を取得
    var yearList = allYearList.filter(function (x, i, self) {
      return self.indexOf(x) === i;
    });

    //年の一覧をソートして、逆順に並べ替え
    yearList.sort();
    yearList.reverse();

    //サイドバーに見出しを挿入
    $('year-menu-wrap').innerHTML += '<div class="list-title"><ons-icon icon="md-calendar"> Livelog</div>';

    //メニュー用のons-list要素を挿入
    var yearMenu = document.createElement('ons-list');
    $('year-menu-wrap').appendChild(yearMenu);

    //メニューの中に表示する年ごとのリンクを追加
    for(var i=0; i<yearList.length; i++) {
      var yearMenuItem = document.createElement('ons-list-item');
      yearMenuItem.innerText = yearList[i];
      yearMenuItem.setAttribute("onclick", "fn.load('" + yearList[i] + ".html')");
      yearMenuItem.setAttribute("tappable", "");
      yearMenu.appendChild(yearMenuItem);
    }

  }

});

window.fn = {};
window.fn.open = function() {
  var menu = document.getElementById('menu');
  menu.open();
};
window.fn.load = function(page) {
  var content = document.getElementById('content');
  var menu = document.getElementById('menu');
  content
    .load(page)
    .then(menu.close.bind(menu));
};

document.addEventListener('init', function(event) {
  var page = event.target;

  if (page.id === 'list') {
    page.querySelector('#add-button').onclick = function() {
      document.querySelector('#myNavigator').pushPage('edit.html');
    };
    console.log(page.data.year);
  } else if (page.id === 'detail') {
    page.querySelector('#push-button').onclick = function() {
      document.querySelector('#myNavigator').pushPage('edit.html');
    };
    page.querySelector('#push-setlist').onclick = function() {
      document.querySelector('#myNavigator').pushPage('setlist.html');
    };
    page.querySelector('#push-member').onclick = function() {
      document.querySelector('#myNavigator').pushPage('member.html');
    };
  } else if (page.id === 'edit') {

  } else if (page.id === 'setlist') {
    page.querySelector('#resist-button').onclick = function() {
      document.querySelector('#myNavigator').popPage({animation: 'fade'});
    };
  } else if (page.id === 'member') {
    page.querySelector('#resist-button').onclick = function() {
      document.querySelector('#myNavigator').popPage({animation: 'fade'});
    };
  }
});

var showDialog = function (id) {
  document
    .getElementById(id)
    .show();
};

var hideDialog = function (id) {
  document
    .getElementById(id)
    .hide();
};

var popPageFade = function (id) {
  document
    .getElementById(id)
    .popPage({animation: 'fade'});
};

var resetToPageFade = function (id) {
  document
    .getElementById(id)
    .resetToPage('home.html' , {animation: 'fade'});
};

//連想配列の値を指定した文字列で連結する関数
function arrayJoin(delimiter, object) {
  var ret = '';
  var lastkey = Object.keys(object).pop();
  for (var k in object) {
    ret += object[k] + (lastkey !== k ? delimiter : '');
  }
  return ret;
}

//2つのキーで連想配列をソートする関数
function ObjArraySort2(ary, key1, order1, key2, order2) {
  var reverse1 = 1;
  var reverse2 = 1;
  if(order1 && order1.toLowerCase() == 'desc')
    reverse1 = -1;
  if(order2 && order2.toLowerCase() == 'desc')
    reverse2 = -1;

  ary.sort(function(a, b) {
    // Compare 1st key
    if(a[key1] < b[key1])
      return -1 * reverse1;
    else if(a[key1] > b[key1])
      return 1 * reverse1;
    else
    {
    // Compare 2nd key
    if(a[key2] < b[key2])
      return -1 * reverse2;
    else if(a[key2] > b[key2])
      return 1 * reverse2;
    else
      return 0;
    }
  });
}

//☆「登録」ボタンが押された時の処理
function liveDataSave() {

  if(localStorage.length > 0) {

    //localStorageのKeyの一覧を格納する配列を生成
    var key = new Array();
    //配列keyにライブ番号の一覧を格納
    for(var i=0; i<localStorage.length; i++) {
      var currentLiveId = localStorage.key(i);
      key[i] = Number(currentLiveId.replace('live', ''));
    }
    //保存されているlivexxの番号のうち最大の整数を取得
    var maxLiveNum = Math.max.apply(null, key);
    //最大値+1を次の登録番号として設定
    var count = maxLiveNum + 1;

  } else {

    // localStorageにデータが登録されていない場合、番号を0にする
    var count = 0;

  }
  console.log('count:' + count);

  var item = {};

  //登録用のオブジェクトに各フォームの値を代入
  item.id = Number(count);
  item.title = $('title').value;
  item.date = $('date').value;
  item.open = $('open').value;
  item.start = $('start').value;
  item.adv = $('adv').value;
  item.door = $('door').value;
  item.area = $('area').value;
  item.place = $('place').value;
  item.address = $('address').value;
  item.info = $('info').value;

  //URLにパラメータがない場合は、artists欄を多次元配列として初期化
  item.artists = {};
  //一人目のアーティストも多次元配列として初期化
  item.artists.artist0 = {};

  //一人目のアーティスト名をフォームの値から代入
  item.artists.artist0.name = $('artist0').value;

  //一人目のアーティストのセットリストも多次元配列として初期化
  item.artists.artist0.setlist = {};
  item.artists.artist0.members = {};

  //type用のフラグを設定
  var typeFlag = false;
  //typeラジオボタンを１つずつ調べてチェックされていたらvalueの値を代入する
  for(var i=0; i<document.form.type.length;i++){
      if(document.form.type[i].checked){
          typeFlag = true;
          item.type = document.form.type[i].value;
      }
  }
  //typeラジオボタンがチェックされていなかったら空文字を代入する
  if(!typeFlag){
    item.type = '';
  }

  //genre用のフラグを設定
  var genreFlag = false;
  //genreラジオボタンを１つずつ調べてチェックされていたらvalueの値を代入する
  for(var i=0; i<document.form.genre.length;i++){
      if(document.form.genre[i].checked){
          genreFlag = true;
          item.genre = document.form.genre[i].value;
      }
  }
  //genreラジオボタンがチェックされていなかったら空文字を代入する
  if(!genreFlag){
    item.genre = '';
  }

  //ticket用のフラグを設定
  var ticketFlag = false;
  //ticketラジオボタンを１つずつ調べてチェックされていたらvalueの値を代入する
  for(var i=0; i<document.form.ticket.length;i++){
      if(document.form.ticket[i].checked){
          ticketFlag = true;
          item.ticket = document.form.ticket[i].value;
      }
  }
  //ticketラジオボタンがチェックされていなかったら空文字を代入する
  if(!ticketFlag){
    item.ticket = '';
  }

  if($('attendance').checked){
    //attendanceチェックボックスがチェックされていたらvalueの値を代入する
    item.attendance = $('attendance').value;
  } else {
    //attendanceチェックボックスがチェックされていなかったら空文字を代入する
    item.attendance = '';
  }

  //登録用のオブジェクトに各フォームの値を代入
  item.memo = $('memo').value;
  item.report = $('report').value;

  //登録用オブジェクトの内容をcount番号のlocalStorageへ上書き保存
  localStorage.setItem(
    'live' + count,
    JSON.stringify(item)
  );
  //登録後、一覧画面へ遷移
   var itemYear = item.date.slice(0, 4);
   document.querySelector('#myNavigator').resetToPage('list.html',{data: {year: itemYear}});

}