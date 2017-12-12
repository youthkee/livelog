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

    //一覧リストの項目を配列として取得
    var listItems = page.getElementsByClassName('live-list-item');
    for (item in listItems) {
      //一覧リストの各項目をタップしたらライブIDを渡してdetail.htmlへ遷移
      var currentListItem = listItems[item];
      currentListItem.onclick = function() {
        var currentListId = this.getAttribute('data-id');
        document.querySelector('#myNavigator').pushPage('detail.html', {data: {live: currentListId}});
      }
    }

  } else if (page.id === 'detail') {

    //ページ遷移時に受け取ったライブIDを変数に代入
    var liveId = page.data.live;
    // そのIDのデータを取り出してitemオブジェクトへ一次保存
    item = JSON.parse(
      localStorage.getItem(liveId)
    );

    // itemオブジェクトの内容を取り出してページ上に表示する
    $('title').innerHTML = item.title;
    $('date').innerHTML = item.date;
    $('open').innerHTML = item.open;
    $('start').innerHTML = item.start;
    $('adv').innerHTML = item.adv;
    $('door').innerHTML = item.door;
    $('area').innerHTML = item.area;
    $('place').innerHTML = item.place;
    $('address').innerHTML = item.address;
    $('info').innerHTML = item.info;

    var dataArtistsNum = Object.keys(item.artists).length;
    //アーティストが1人以上登録されていたら、1人目のアーティスト名を表示
    if(dataArtistsNum > 0) {
      //1人目のアーティスト名を表示
      $('artist0').innerHTML = item.artists.artist0.name;
    }

    $('type').innerHTML = item.type;
    $('genre').innerHTML = item.genre;
    $('ticket').innerHTML = item.ticket;
    $('attendance').innerHTML = item.attendance;
    $('memo').innerHTML = item.memo;
    $('report').innerHTML = item.report;

    //編集ボタンをタップしたらライブIDを渡してedit.htmlへ遷移
    page.querySelector('#edit-button').onclick = function() {
      document.querySelector('#myNavigator').pushPage('edit.html', {data: {live: liveId}});
    };

    //INFOにURLが登録されていたら、タップ時にInAppBrowserで開く
    if (item.info) {
      page.querySelector('#info-link').onclick = function() {
        window.open(item.info, '_blank');
      };
    }

    //REPORTにURLが登録されていたら、タップ時にInAppBrowserで開く
    if (item.report) {
      page.querySelector('#report-link').onclick = function() {
        window.open(item.report, '_blank');
      };
    }

  } else if (page.id === 'edit') {
      
    //ページ遷移時に受け取ったライブIDを変数に代入
    var liveId = page.data.live;

    //☆新規登録時の登録番号を決める処理
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

    //再編集時に既存のデータを読み込む処理
    if (liveId) {

      //既存のライブIDが存在する場合は、その値を登録番号にする
      var count = Number(liveId.replace('live', ''));

      // その番号のデータを取り出してitemオブジェクトへ一次保存
      item = JSON.parse(
        localStorage.getItem('live' + count)
      );
      // itemオブジェクトの内容を取り出して各フォームに入力状態にする
      $('title-input').value = item.title;
      $('date-input').value = item.date;
      $('open-input').value = item.open;
      $('start-input').value = item.start;
      $('adv-input').value = item.adv;
      $('door-input').value = item.door;
      $('area-input').value = item.area;
      $('place-input').value = item.place;
      $('address-input').value = item.address;
      $('info-input').value = item.info;
      $('artist-input0').value = item.artists.artist0.name;

      //typeラジオボタンのvalueとitemオブジェクト内の値が一致したらチェックを入れる
      for(var i=0; i<document.form.type.length;i++){
          if(document.form.type[i].value == item.type){
              document.form.type[i].checked = true;
          }
      }

      //genreラジオボタンのvalueとitemオブジェクト内の値が一致したらチェックを入れる
      for(var i=0; i<document.form.genre.length;i++){
          if(document.form.genre[i].value == item.genre){
              document.form.genre[i].checked = true;
          }
      }

      //ticketラジオボタンのvalueとitemオブジェクト内の値が一致したらチェックを入れる
      for(var i=0; i<document.form.ticket.length;i++){
          if(document.form.ticket[i].value == item.ticket){
              document.form.ticket[i].checked = true;
          }
      }

      //attendanceチェックボックスのvalueとitemオブジェクト内の値が一致したらチェックを入れる
      if($('attendance-input').value == item.attendance){
        $('attendance-input').checked = true;
      }

      // itemオブジェクトの内容を取り出して各フォームに入力状態にする
      $('memo-input').value = item.memo;
      $('report-input').value = item.report;
      
      $('delete').innerHTML = '<ons-button modifier="large light" class="button--light--livelog" id="delete-button">ライブ情報を削除</ons-button>';

    } else {
      //ライブIDがなかったら、登録用のオブジェクトを初期化
      var item = {};
    }

    //☆「登録」ボタンが押された時の処理
    page.querySelector('#resist-button').onclick = function() {

      //登録用のオブジェクトに各フォームの値を代入
      item.id = Number(count);
      item.title = $('title-input').value;
      item.date = $('date-input').value;
      item.open = $('open-input').value;
      item.start = $('start-input').value;
      item.adv = $('adv-input').value;
      item.door = $('door-input').value;
      item.area = $('area-input').value;
      item.place = $('place-input').value;
      item.address = $('address-input').value;
      item.info = $('info-input').value;

      //URLにパラメータがない場合は、artists欄を多次元配列として初期化
      item.artists = {};
      //一人目のアーティストも多次元配列として初期化
      item.artists.artist0 = {};

      //一人目のアーティスト名をフォームの値から代入
      item.artists.artist0.name = $('artist-input0').value;

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

      if($('attendance-input').checked){
        //attendanceチェックボックスがチェックされていたらvalueの値を代入する
        item.attendance = $('attendance-input').value;
      } else {
        //attendanceチェックボックスがチェックされていなかったら空文字を代入する
        item.attendance = '';
      }

      //登録用のオブジェクトに各フォームの値を代入
      item.memo = $('memo-input').value;
      item.report = $('report-input').value;

      //登録用オブジェクトの内容をcount番号のlocalStorageへ上書き保存
      localStorage.setItem(
        'live' + count,
        JSON.stringify(item)
      );
      //登録後、一覧画面へ遷移
       var itemYear = item.date.slice(0, 4);
       document.querySelector('#myNavigator').resetToPage('list.html',{data: {year: itemYear}});

    };

    if (liveId) {
        //☆「ライブ情報を削除」ボタンが押された時の処理
        page.querySelector('#delete-button').onclick = function() {
    
          ons.notification.confirm({
            message: 'ライブ情報を削除してよろしいですか？',
            title: '',
            primaryButtonIndex: 1,
            cancelable: true,
            modifier: 'material',
            callback: function(index) {
                switch(index) {
                  case 1:
                    //該当のライブ情報をlocalStorageから削除
                    localStorage.removeItem('live' + count);
                    //ライブ一覧ページを再読み込み
                    fn.load('home.html');
                    break;
                }
            }
          });
    
        };
    }

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

document.addEventListener('ons-alert-dialog:init', function(e) {
    if (e.target.id == 'dialog-2') {
      console.log(data.live)
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

//日付型チェック関数（YYYY/MM/DD形式）
function ckDate(datestr) {
    // 正規表現による書式チェック
    if(!datestr.match(/^\d{4}\/\d{2}\/\d{2}$/)){
        return false;
    }
    var vYear = datestr.substr(0, 4) - 0;
    var vMonth = datestr.substr(5, 2) - 1; // Javascriptは、0-11で表現
    var vDay = datestr.substr(8, 2) - 0;
    // 月,日の妥当性チェック
    if(vMonth >= 0 && vMonth <= 11 && vDay >= 1 && vDay <= 31){
        var vDt = new Date(vYear, vMonth, vDay);
        if(isNaN(vDt)){
            return false;
        }else if(vDt.getFullYear() == vYear && vDt.getMonth() == vMonth && vDt.getDate() == vDay){
            return true;
        }else{
            return false;
        }
    }else{
        return false;
    }
}

//時間型チェック関数（HH:MM形式）
function ckTime(str) {
    // 正規表現による書式チェック
    if(!str.match(/^\d{2}\:\d{2}$/)){
        return false;
    }
    var vHour = str.substr(0, 2) - 0;
    var vMinutes = str.substr(3, 2) - 0;
    if(vHour >= 0 && vHour <= 24 && vMinutes >= 0 && vMinutes <= 59){
        return true;
    }else{
    }
}

//URL型チェック関数
function isUrl(str) {
  var pattern = new RegExp('^(https?:\\/\\/)?'+ // protocol
    '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // domain name
    '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
    '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
    '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
    '(\\#[-a-z\\d_]*)?$','i'); // fragment locator

  if(!pattern.test(str)) {
    return false;
  } else {
    return true;
  }
}

//☆年のプルダウンを選択した時の処理
function changeYear(obj){
  document.querySelector('#myNavigator').resetToPage('list.html', {data: {year: obj.value}});
}

//☆「+」ボタンが押された時の処理
function artistInputAdd(obj) {
  var currentInputId = obj.parentNode.parentNode.previousElementSibling.firstElementChild.getAttribute('id');
  var currentArtistNum = Number(currentInputId.replace('artist-input', ''));
  //次の番号のアーティスト欄と「+」と「-」ボタンを生成し、下の段に挿入
  var nextArtistInput = document.createElement('ul');
  nextArtistInput.setAttribute('class', 'list');
  nextArtistInput.innerHTML = '<li class="list-item"><div class="list-item__center"><input type="text" class="text-input artist-input" id="artist-input' + (currentArtistNum + 1) + '" placeholder="NAME"></div><div class="list-item__right"><div class="list-item__label"><ons-icon icon="md-plus" size="20px" class="icon--tappable" onclick="artistInputAdd(this);"></ons-icon><ons-icon icon="md-minus" size="20px" class="icon--tappable" onclick="artistInputDelete(this);"></ons-icon></div></li>';
  obj.parentNode.parentNode.parentNode.parentNode.parentNode.appendChild(nextArtistInput);
  //2回目以降については「+」ボタンの右横の「-」ボタンも削除する
  var currentInputDelete = obj.nextElementSibling;
  if (currentInputDelete){
    obj.parentNode.removeChild(currentInputDelete);
  }
  //クリックされた「+」ボタン自体を削除する
  obj.parentNode.removeChild(obj);
}

//☆「-」ボタンが押された時の処理
function artistInputDelete(obj) {
  var currentInputId = obj.parentNode.parentNode.previousElementSibling.firstElementChild.getAttribute('id');
  var currentArtistNum = Number(currentInputId.replace('artist-input', ''));
  //1個前のアーティスト入力欄の隣に「+」ボタンを追加
  var previousArtistInput = obj.parentNode.parentNode.parentNode.parentNode.previousElementSibling;
  var previousArtistButton1 = document.createElement('ons-icon');
  previousArtistButton1.setAttribute('icon', 'md-plus');
  previousArtistButton1.setAttribute('size', '20px');
  previousArtistButton1.setAttribute('class', 'icon--tappable');
  previousArtistButton1.setAttribute('onclick', 'artistInputAdd(this);');
  previousArtistInput.getElementsByTagName('div')[2].appendChild(previousArtistButton1);
  //1個前のアーティスト入力欄の隣に「-」ボタンを追加（最初の入力欄の時は追加しない）
  if (currentArtistNum > 1) {
    var previousArtistButton2 = document.createElement('ons-icon');
    previousArtistButton2.setAttribute('icon', 'md-minus');
    previousArtistButton2.setAttribute('size', '20px');
    previousArtistButton2.setAttribute('class', 'icon--tappable');
    previousArtistButton2.setAttribute('onclick', 'artistInputDelete(this);');
    previousArtistInput.getElementsByTagName('div')[2].appendChild(previousArtistButton2);
  }
  //該当のアーティスト入力欄を削除
  var currentArtistInput = obj.parentNode.parentNode.parentNode.parentNode;
  obj.parentNode.parentNode.parentNode.parentNode.parentNode.removeChild(currentArtistInput);
}

//☆データを全削除する処理
function allDataClear() {

  ons.notification.confirm({
    message: '全てのライブ情報を削除してよろしいですか？',
    title: '',
    primaryButtonIndex: 1,
    cancelable: true,
    modifier: 'material',
    callback: function(index) {
        switch(index) {
          case 1:
            //localStorageをクリア
            localStorage.clear();
            //ライブ一覧ページを再読み込み
            fn.load('home.html');
            break;
        }
    }
  });

}