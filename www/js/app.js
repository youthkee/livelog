function $(id){return document.getElementById(id);}

ons.ready(function() {
  console.log("Onsen UI is ready!");
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

  if (page.id === 'home') {

  } else if (page.id === 'list') {

    page.querySelector('#add-button').onclick = function() {
      document.querySelector('#myNavigator').pushPage('edit.html');
    };

    //☆localStorageにデータが登録されていたら一覧表示する処理
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

      //登録されている年の中から一番新しい年を取得
      var maxYear = Math.max.apply(null, yearList);

      //現在の年を取得
      var now = new Date();
      var currentYear = now.getFullYear();

      if (page.data.year) {
        //年パラメータが指定されていたら、それをselectedYearにする
        var selectedYear = page.data.year;
      } else if (maxYear >= currentYear) {
        //現在よりも未来の年が登録されている場合は、今年をselectedYearにする
        var selectedYear = currentYear;
      } else {
        //現在よりも過去の年しか登録されていない場合は、その中で一番新しい年をselectedYearにする
        var selectedYear = maxYear;
      }

      //年のプルダウンを格納するためのセレクトボックスを生成
      var yearSelect = document.createElement('ons-select');
      yearSelect.setAttribute('class', 'select--livelog');
      yearSelect.setAttribute('id', 'select-year');
      yearSelect.setAttribute('onChange', 'changeYear(this);');
      $('list-title').appendChild(yearSelect);

      //セレクトボックスの中に登録されている年のプルダウンを追加
      for(var i=0; i<yearList.length; i++) {
        var yearOption = document.createElement('option');
        yearOption.innerText = yearList[i];
        yearOption.setAttribute('value', yearList[i]);
        //selectedYearと同じ値があったら選択状態にする
        if (yearList[i] == selectedYear) {
          yearOption.setAttribute('selected', 'selected');
        }
        yearSelect.appendChild(yearOption);
      }

      //localStorageから読み込んだデータから、選択中の年のデータだけ抽出
      var currentItem = allItem.filter(function(item, index){
        if ((item.date).indexOf(selectedYear) >= 0) return true;
      });

      //プルダウンで選択された年にライブが登録されていたら、日付が新しい順に一覧表示
      for(var i=0; i<currentItem.length; i++) {

        //artist0〜artist*の値を配列で取得
        var artistsItemLabel = Object.keys(currentItem[i].artists);

        //アーティスト名一覧を格納するための配列を作成
        var artistsItem = [];

        //アーティスト用の配列に登録されている分だけのアーティスト名を入力
        for (j = 0; j < artistsItemLabel.length; j++) {
          var currentArtsitLabel = 'artist' + j;
          artistsItem[j] = currentItem[i].artists[currentArtsitLabel].name;
        }

        //アーティスト名の配列をつなげて文字列に変換
        var artistsItemJoin = arrayJoin(', ', artistsItem);
        
        //日付から年号を削除して変数に代入
        var currentDay = currentItem[i].date.slice(5, 10);

        $('live-list').innerHTML += '<ons-list-item class="live-list-item" data-id="live' + currentItem[i].id + '" tappable><div class="center"><span class="list-item__title">' + currentItem[i].title + '＠' + currentItem[i].area + ' ' + currentItem[i].place + '</span><span class="list-item__subtitle"><ons-icon icon="md-time"></ons-icon> ' + currentDay + ' OPEN ' + currentItem[i].open + ' / START ' + currentItem[i].start + '<br><ons-icon icon="md-face"></ons-icon> ' + artistsItemJoin + '<br><ons-icon icon="md-ticket-star"></ons-icon> ' + currentItem[i].ticket + ' <span class="attendance">' + currentItem[i].attendance + '</span></span></div></ons-list-item>';

      }

    } else {
      //データが登録されていなかったら文言を表示
      $('list-title').innerHTML = 'Livelog';
      $('live-list').innerHTML = '<ons-list-item><div class="center">ライブが登録されていません。</div></ons-list-item>';
    }

    var listItems = page.getElementsByClassName('live-list-item');
    for (item in listItems) {
      var currentListItem = listItems[item];
      currentListItem.onclick = function() {
        var currentListId = this.getAttribute('data-id');
        document.querySelector('#myNavigator').pushPage('detail.html', {data: {live: currentListId}});
      }
    }

  } else if (page.id === 'detail') {
    console.log(page.data.live);
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
    console.log(page.data.year);
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

//☆年のプルダウンを選択した時の処理
function changeYear(obj){
  console.log(obj.value);
  document.querySelector('#myNavigator').resetToPage('list.html', {data: {year: obj.value}});
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
