function $(id){return document.getElementById(id);}

document.addEventListener('deviceready', onDeviceReady, false);

function onDeviceReady() {
    window.open = cordova.InAppBrowser.open;
}

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
      var minYear = Math.min.apply(null, yearList);

      //現在の年を取得
      var now = new Date();
      var currentYear = now.getFullYear();

      if (page.data.year) {
        //年パラメータが指定されていたら、それをselectedYearにする
        var selectedYear = page.data.year;
      } else {
        if (yearList.indexOf(String(currentYear)) >= 0){
          //yearListに今年が含まれている時、今年をselectedYearにする
          var selectedYear = currentYear;
        } else {
          //yearListに今年が含まれていない時
          if (minYear > currentYear) {
            //yearListの最小値が今年より大きい時、最小値をselectedYearにする
            var selectedYear = minYear;
          } else {
            if (maxYear < currentYear) {
              //yearListの最大値が今年より小さい時、最大値をselectedYearにする
              var selectedYear = maxYear;
            } else {
              //yearListの最大値が今年より大きい時、今年より大きな値のみ抽出し、その最小値をselectedYearにする
              var futureList = yearList.filter(function (element) {
                return element > currentYear;
              });
              var selectedYear = Math.min.apply(null, futureList);
            }
          }
        }
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

      var infiniteList = document.getElementById('infinite-list');

      infiniteList.delegate = {
        createItemContent: function(i) {

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

          return ons.createElement('<ons-list-item class="live-list-item" data-live="live' + currentItem[i].id + '" tappable onclick="openLiveDetail(this);"><div class="center"><span class="list-item__title">' + currentItem[i].title + '＠' + currentItem[i].area + ' ' + currentItem[i].place + '</span><span class="list-item__subtitle"><ons-icon icon="md-time"></ons-icon> ' + currentDay + ' OPEN ' + currentItem[i].open + ' / START ' + currentItem[i].start + '<br><ons-icon icon="md-face"></ons-icon> ' + artistsItemJoin + '<br><ons-icon icon="md-ticket-star"></ons-icon> ' + currentItem[i].ticket + ' <span class="attendance">' + currentItem[i].attendance + '</span></span></div></ons-list-item>');

        },
        countItems: function() {
          return currentItem.length;
        }
      };

    } else {
      //データが登録されていなかったら文言を表示
      $('list-title').innerHTML = 'Livelog';
      $('live-list').innerHTML = '<ons-list-item><div class="center">ライブが登録されていません。</div></ons-list-item>';
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

      //1人目のセットリストの内容をオブジェクトとして取得
      var firstSetlistNum = Object.keys(item.artists.artist0.setlist).length;
      var firstSetlistItem = Object.keys(item.artists.artist0.setlist).map(function(key) {
          return item.artists.artist0.setlist[key];
      });

      //1人目のアーティスト名の下にセットリスト欄を追加
      var firstArtistList = document.getElementById('artist0').parentNode.parentNode;
      var firstSetlistTitle = document.createElement('li');
      firstSetlistTitle.setAttribute('class', 'list-item list-item--nodivider');
      firstSetlistTitle.innerHTML = '<div class="list-item__center list-item--nodivider__center"><div class="list-item__title"><div class="list-item__label">SETLIST</div></div></div><div class="list-item__right list-item--nodivider__right"><div class="list-item__label"><ons-icon icon="md-edit" size="20px" class="icon--tappable setlist-button" data-artist="artist0"></ons-icon></div></div>';
      firstArtistList.appendChild(firstSetlistTitle);

      //1人目のセットリストのツイート文言用の変数を生成
      var firstTwTxt1 = item.title + '＠' + item.area + item.place + '%0d%0a%23' + item.artists.artist0.name + '%20さんのセットリスト' + '%0d%0a%0d%0a';
      var firstTwTxt2 = '';
      var firstTwTxt3 = '%0d%0a%23ライブ%20%23' + item.genre +'%20%23livelog';

      //セットリストが登録されていたら、セットリストの内容をリスト表示
      if (firstSetlistNum > 0) {
        for (track in firstSetlistItem) {
          var trackId = Number(track.replace('track', ''));
          var additionalTrack = document.createElement('li');
          additionalTrack.setAttribute('class', 'list-item list-item--nodivider');
          additionalTrack.innerHTML = '<div class="list-item__center list-item--nodivider__center"><div class="list-item__label">' + (trackId + 1) + '</div></div><div class="list-item__right list-item--nodivider__right">' + firstSetlistItem[track] + '</div>';
          firstArtistList.appendChild(additionalTrack);
          //ツイート文言用の変数にもセットリストを追加
          firstTwTxt2 += firstSetlistItem[track] + '%0d%0a';
        }
        //1人目のセットリストの下にツイート用のリンクを追加
        var firstSetlistTweet = document.createElement('a');
        firstSetlistTweet.setAttribute('href', 'https://twitter.com/intent/tweet?text=' + firstTwTxt1 + firstTwTxt2 + firstTwTxt3);
        firstSetlistTweet.setAttribute('target', '_blank');
        firstSetlistTweet.setAttribute('class', 'icon-link');
        firstSetlistTweet.innerHTML = '<ons-icon icon="md-twitter" size="20px" class="icon--tappable"></ons-icon>';
        firstSetlistTitle.getElementsByTagName('div')[3].appendChild(firstSetlistTweet);
      }

      //1人目のメンバーの内容をオブジェクトとして取得
      var firstMemberNum = Object.keys(item.artists.artist0.members).length;
      var firstMemberItem = Object.keys(item.artists.artist0.members);
      //1人目のアーティスト名の下にメンバー欄を追加
      var firstMemberTitle = document.createElement('li');
      firstMemberTitle.setAttribute('class', 'list-item list-item--nodivider');
      firstMemberTitle.innerHTML = '<div class="list-item__center list-item--nodivider__center"><div class="list-item__title"><div class="list-item__label">MEMBER</div></div></div><div class="list-item__right list-item--nodivider__right"><div class="list-item__label"><ons-icon icon="md-edit" size="20px" class="icon--tappable member-button" data-artist="artist0"></ons-icon></div></div>';
      firstArtistList.appendChild(firstMemberTitle);

      //メンバーが登録されていたら、メンバーの内容をリスト表示
      if (firstMemberNum > 0) {
        for (member in firstMemberItem) {
          var additionalMember = document.createElement('li');
          var additionalMemberId = firstMemberItem[member];
          additionalMember.setAttribute('class', 'list-item list-item--nodivider');
          additionalMember.innerHTML = '<div class="list-item__center list-item--nodivider__center"><div class="list-item__label">' + item.artists.artist0.members[additionalMemberId].part + '</div></div><div class="list-item__right list-item--nodivider__right">' + item.artists.artist0.members[additionalMemberId].name + '</div>';
          firstArtistList.appendChild(additionalMember);
        }
      }

    }

    //複数アーティストが登録されていたら、artist1以降の分だけリスト要素を増やして内容を表示
    if(dataArtistsNum > 1) {
      for(var i=1; i<dataArtistsNum; i++) {
        var nextArtistId = 'artist' + i;
        var currentArtistId = 'artist' + (i - 1);
        var currentArtistList = document.getElementById(currentArtistId).parentNode.parentNode;
        //現在のアーティストの下に次のアーティストを追加
        var nextArtistList = document.createElement('ul');
        nextArtistList.setAttribute('class', 'list');
        nextArtistList.innerHTML = '<li class="list-item"><div class="list-item__center" id="' + nextArtistId + '">' + item.artists[nextArtistId].name + '</div></li>';
        currentArtistList.parentNode.appendChild(nextArtistList);

        //次のアーティストのセットリストの内容をオブジェクトとして取得
        var nextSetlistNum = Object.keys(item.artists[nextArtistId].setlist).length;
        var nextSetlistItem = Object.keys(item.artists[nextArtistId].setlist).map(function(key) {
            return item.artists[nextArtistId].setlist[key];
        });
        //次のアーティスト名の下にセットリスト欄を追加
        var nextSetlistTitle = document.createElement('li');
        nextSetlistTitle.setAttribute('class', 'list-item list-item--nodivider');
        nextSetlistTitle.innerHTML = '<div class="list-item__center list-item--nodivider__center"><div class="list-item__title"><div class="list-item__label">SETLIST</div></div></div><div class="list-item__right list-item--nodivider__right"><div class="list-item__label"><ons-icon icon="md-edit" size="20px" class="icon--tappable setlist-button" data-artist="artist' + i + '"></ons-icon></div></div>';
        nextArtistList.appendChild(nextSetlistTitle);

        //次のアーティストのツイート文言用の変数を生成
        var nextTwTxt1 = item.title + '＠' + item.area + item.place + '%0d%0a%23' + item.artists[nextArtistId].name + '%20さんのセットリスト' + '%0d%0a%0d%0a';
        var nextTwTxt2 = '';
        var nextTwTxt3 = '%0d%0a%23ライブ%20%23' + item.genre +'%20%23livelog';
        //セットリストが登録されていたら、セットリストの内容をリスト表示
        if (nextSetlistNum > 0) {
          for (track in nextSetlistItem) {
            var trackId = Number(track.replace('track', ''));
            var additionalTrack = document.createElement('li');
            additionalTrack.setAttribute('class', 'list-item list-item--nodivider');
            additionalTrack.innerHTML = '<div class="list-item__center list-item--nodivider__center"><div class="list-item__label">' + (trackId + 1) + '</div></div><div class="list-item__right list-item--nodivider__right">' + nextSetlistItem[track] + '</div>';
            nextArtistList.appendChild(additionalTrack);
            //ツイート文言用の変数にもセットリストを追加
            nextTwTxt2 += nextSetlistItem[track] + '%0d%0a';
          }
          //次のアーティストのセットリストの下にツイート用のリンクを追加
          var nextSetlistTweet = document.createElement('a');
          nextSetlistTweet.setAttribute('href', 'https://twitter.com/intent/tweet?text=' + nextTwTxt1 + nextTwTxt2 + nextTwTxt3);
          nextSetlistTweet.setAttribute('target', '_blank');
          nextSetlistTweet.setAttribute('class', 'icon-link');
          nextSetlistTweet.innerHTML = '<ons-icon icon="md-twitter" size="20px" class="icon--tappable"></ons-icon>';
          nextSetlistTitle.getElementsByTagName('div')[3].appendChild(nextSetlistTweet);
        }

        //次のアーティストのメンバーの内容をオブジェクトとして取得
        var nextMemberNum = Object.keys(item.artists[nextArtistId].members).length;
        var nextMemberItem = Object.keys(item.artists[nextArtistId].members);
        //次のアーティスト名の下にメンバー欄を追加
        var nextMemberTitle = document.createElement('li');
        nextMemberTitle.setAttribute('class', 'list-item list-item--nodivider');
        nextMemberTitle.innerHTML = '<div class="list-item__center list-item--nodivider__center"><div class="list-item__title"><div class="list-item__label">MEMBER</div></div></div><div class="list-item__right list-item--nodivider__right"><div class="list-item__label"><ons-icon icon="md-edit" size="20px" class="icon--tappable member-button" data-artist="artist' + i + '"></ons-icon></div></div>';
        nextArtistList.appendChild(nextMemberTitle);
        //メンバーが登録されていたら、メンバーの内容をリスト表示
        if (nextMemberNum > 0) {
          for (member in nextMemberItem) {
            var additionalMember = document.createElement('li');
            var additionalMemberId = nextMemberItem[member];
            additionalMember.setAttribute('class', 'list-item list-item--nodivider');
            additionalMember.innerHTML = '<div class="list-item__center list-item--nodivider__center"><div class="list-item__label">' + item.artists[nextArtistId].members[additionalMemberId].part + '</div></div><div class="list-item__right list-item--nodivider__right">' + item.artists[nextArtistId].members[additionalMemberId].name + '</div>';
            nextArtistList.appendChild(additionalMember);
          }
        }

      }
    }

    $('type').innerHTML = item.type;
    $('genre').innerHTML = item.genre;
    $('ticket').innerHTML = item.ticket;
    $('attendance').innerHTML = item.attendance;
    $('memo').innerHTML = item.memo.replace(/\n/g, '<br>');
    $('report').innerHTML = item.report;

    //編集ボタンをタップしたらライブIDを渡してedit.htmlへ遷移
    page.querySelector('#edit-button').onclick = function() {
      document.querySelector('#myNavigator').pushPage('edit.html', {data: {live: liveId}});
    };

    //INFOにURLが登録されていたら、タップ時にInAppBrowserで開く
    if (item.info) {
      page.querySelector('#info-link').onclick = function() {
        window.open(item.info, '_system');
      };
    }

    //REPORTにURLが登録されていたら、タップ時にInAppBrowserで開く
    if (item.report) {
      page.querySelector('#report-link').onclick = function() {
        window.open(item.report, '_system');
      };
    }

    //一覧リストの項目を配列として取得
    var setlistButtons = page.getElementsByClassName('setlist-button');
    for (button in setlistButtons) {
      //一覧リストの各項目をタップしたらライブIDを渡してdetail.htmlへ遷移
      var currentSetlistButton = setlistButtons[button];
      currentSetlistButton.onclick = function() {
        var currentArtistId = this.getAttribute('data-artist');
        document.querySelector('#myNavigator').pushPage('setlist.html', {data: {live: liveId, artist: currentArtistId}});
      };
    }

    //一覧リストの項目を配列として取得
    var memberButtons = page.getElementsByClassName('member-button');
    for (button in memberButtons) {
      //一覧リストの各項目をタップしたらライブIDを渡してdetail.htmlへ遷移
      var currentSetlistButton = memberButtons[button];
      currentSetlistButton.onclick = function() {
        var currentArtistId = this.getAttribute('data-artist');
        document.querySelector('#myNavigator').pushPage('member.html', {data: {live: liveId, artist: currentArtistId}});
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

      //複数アーティストが登録されていたら、artist1以降の分だけフォームを増やして値を入力
      var dataArtistsNum = Object.keys(item.artists).length;
      if(dataArtistsNum > 1) {
        for(var i=1; i<dataArtistsNum; i++) {
          var currentArtistInput = document.getElementsByClassName('artist-input')[i-1];
          var artistAddButton = currentArtistInput.parentNode.nextElementSibling.firstElementChild.firstElementChild;
          var artistAddButton2 = currentArtistInput.parentNode.nextElementSibling.firstElementChild.firstElementChild.nextElementSibling;
          //次の番号のアーティスト欄と「+」「-」ボタンを生成し、一つ前のアーティストの下段に挿入
          var nextArtistForm = document.createElement('ul');
          nextArtistForm.setAttribute('class', 'list');
          nextArtistForm.innerHTML = '<li class="list-item"><div class="list-item__center"><input type="text" class="text-input artist-input" id="artist-input' + i + '" placeholder="ARTIST' + (i+1) + '"></div><div class="list-item__right"><div class="list-item__label"><ons-icon icon="md-plus" size="20px" class="icon--tappable" onclick="artistInputAdd(this);"></ons-icon><ons-icon icon="md-minus" size="20px" class="icon--tappable" onclick="artistInputDelete(this);"></ons-icon></div></div></li>';
          currentArtistInput.parentNode.parentNode.parentNode.parentNode.appendChild(nextArtistForm);
          //一つ前のアーティスト横の「+」ボタンを削除
          currentArtistInput.parentNode.nextElementSibling.firstElementChild.removeChild(artistAddButton);
          //一つ前のアーティスト横の「-」ボタンを削除
          if(artistAddButton2){
            currentArtistInput.parentNode.nextElementSibling.firstElementChild.removeChild(artistAddButton2);
          }
          var nextArtistId = 'artist' + i;
          var nextArtistInput = document.getElementsByClassName('artist-input')[i];
          //追加したアーティスト欄に既存の値を入力
          nextArtistInput.value = item.artists[nextArtistId].name;
        }
      }

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

      //エラーメッセージの要素とその要素数を取得
      var messageNum = document.getElementsByClassName('message').length;
      var messageList = document.getElementsByClassName('message');

      //エラーメッセージが表示されていたら最初に全て消す（登録ボタンを複数回御した時の対策）
      if (messageNum > 0) {
          for(var i=0; i<messageNum; i++) {
              $('error').removeChild(messageList[0]);
          }
      }

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

      if (!liveId) {
        //URLにパラメータがない場合は、artists欄を多次元配列として初期化
        item.artists = {};
        //一人目のアーティストも多次元配列として初期化
        item.artists.artist0 = {};
      }

      //一人目のアーティスト名をフォームの値から代入
      item.artists.artist0.name = $('artist-input0').value;

      if (!liveId) {
        //一人目のアーティストのセットリストも多次元配列として初期化
        item.artists.artist0.setlist = {};
        item.artists.artist0.members = {};
      }

      //フォームのアーティスト欄を配列として取得
      var allArtistNum = document.getElementsByClassName('artist-input').length;
      var artistList = document.getElementsByClassName('artist-input');

      //localStorageに保存されているアーティスト一覧を配列として取得
      var dataArtistNum = Object.keys(item.artists).length;
      var dataArtistList = Object.keys(item.artists);

      //複数のアーティスト欄が表示されている場合、artist1以降の値をオブジェクトに代入
      if (allArtistNum > 1) {
        for(var i=1; i<allArtistNum; i++) {
          var targetArtistId = artistList[i].id.replace('-input', '');
          //アーティストが未登録の場合artistオブジェクトを初期化
          if (!item.artists[targetArtistId]) {
            item.artists[targetArtistId] = {};
          }
          item.artists[targetArtistId].name = artistList[i].value;
          //アーティストのセットリストが未登録の場合setlistオブジェクトを初期化
          if (!item.artists[targetArtistId].setlist) {
            item.artists[targetArtistId].setlist = {};
          }
          //アーティストのメンバーが未登録の場合membersオブジェクトを初期化
          if (!item.artists[targetArtistId].members) {
            item.artists[targetArtistId].members = {};
          }
        }
      }

      //アーティスト欄が削除されていたら、削除分のアーティストを登録用オブジェクトから削除
      if (allArtistNum < dataArtistNum) {
        var diffArtistNum = dataArtistNum - allArtistNum;
        var deleteArtistList = dataArtistList.splice(allArtistNum, diffArtistNum);
        for (var j in deleteArtistList) {
          var deleteArtistId = deleteArtistList[j];
          delete item.artists[deleteArtistId];
        }
      }

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

      //入力エラー用のフラグを設定
      var errorFlag = false;
      var errorArea = $('error');

      //TITLE欄が未入力だったら、エラー用フラグを立てて、エラーメッセージを表示
      if($('title-input').value == '') {
        var errorFlag = true;
        var errorTitle = document.createElement('li');
        errorTitle.setAttribute('class', 'list-item message');
        errorTitle.innerHTML = '<div class="list-item__center">TITLEを入力してください。</div>';
        errorArea.appendChild(errorTitle);
      }

      //日付の型チェックをして戻り値を変数に格納
      var dateFormat = ckDate($('date-input').value);

      if($('date-input').value == '') {
        //DATE欄が未入力だったら、エラー用フラグを立てて、エラーメッセージを表示
        var errorFlag = true;
        var errorDate = document.createElement('li');
        errorDate.setAttribute('class', 'list-item message');
        errorDate.innerHTML = '<div class="list-item__center">DATEを入力してください。</div>';
        errorArea.appendChild(errorDate);
      } else if (!dateFormat) {
        //DATEのフォーマットが不正だったら、エラー用フラグを立てて、エラーメッセージを表示
        var errorFlag = true;
        var errorDate = document.createElement('li');
        errorDate.setAttribute('class', 'list-item message');
        errorDate.innerHTML = '<div class="list-item__center">DATEは「YYYY/MM/DD」の形式（例：2007/09/05）で入力してください。</div>';
        errorArea.appendChild(errorDate);
      }

      //時間の型チェックをして戻り値を変数に格納
      var openFormat = ckTime($('open-input').value);
      var startFormat = ckTime($('start-input').value);

      //OPENが入力されていて、かつフォーマットが不正の場合は、エラー用フラグを立てて、エラーメッセージを表示
      if($('open-input').value == '') {
      } else if (!openFormat) {
        var errorFlag = true;
        var errorOpen = document.createElement('li');
        errorOpen.setAttribute('class', 'list-item message');
        errorOpen.innerHTML = '<div class="list-item__center">OPENは「HH:MM」の形式（例：18:30）で入力してください。</div>';
        errorArea.appendChild(errorOpen);
      }

      //STARTが入力されていて、かつフォーマットが不正の場合は、エラー用フラグを立てて、エラーメッセージを表示
      if($('start-input').value == '') {
      } else if (!startFormat) {
        var errorFlag = true;
        var errorStart = document.createElement('li');
        errorStart.setAttribute('class', 'list-item message');
        errorStart.innerHTML = '<div class="list-item__center">STARTは「HH:MM」の形式（例：19:00）で入力してください。</div>';
        errorArea.appendChild(errorStart);
      } else if ($('open-input').value > $('start-input').value) {
        var errorFlag = true;
        var errorStart = document.createElement('li');
        errorStart.setAttribute('class', 'list-item message');
        errorStart.innerHTML = '<div class="list-item__center">STARTはOPENより後の時間にしてください。</div>';
        errorArea.appendChild(errorStart);
      }

      //アーティスト欄の数だけ入力チェックして、未入力だったら、エラー用フラグを立てて、エラーメッセージを表示
      for(var i=0; i<allArtistNum; i++) {
        if(artistList[i].value == '') {
          var errorFlag = true;
          var errorArtist = document.createElement('li');
          errorArtist.setAttribute('class', 'list-item message');
          errorArtist.innerHTML = '<div class="list-item__center">ARTIST' + (i+1) + 'を入力してください。</div>';
          errorArea.appendChild(errorArtist);
        }
      }

      //URLの型チェックをして戻り値を変数に格納
      var infoFormat = isUrl($('info-input').value);
      var reportFormat = isUrl($('report-input').value);

      //INFOが入力されていて、かつフォーマットが不正の場合は、エラー用フラグを立てて、エラーメッセージを表示
      if($('info-input').value == '') {
      } else if (!infoFormat) {
        var errorFlag = true;
        var errorInfo = document.createElement('li');
        errorInfo.setAttribute('class', 'list-item message');
        errorInfo.innerHTML = '<div class="list-item__center">INFOはURLの形式（例：http://hatsune-official.com）で入力してください。</div>';
        errorArea.appendChild(errorInfo);
      }

      //REPORTが入力されていて、かつフォーマットが不正の場合は、エラー用フラグを立てて、エラーメッセージを表示
      if($('report-input').value == '') {
      } else if (!reportFormat) {
        var errorFlag = true;
        var errorReport = document.createElement('li');
        errorReport.setAttribute('class', 'list-item message');
        errorReport.innerHTML = '<div class="list-item__center">REPORTはURLの形式（例：http://hatsune-official.com）で入力してください。</div>';
        errorArea.appendChild(errorReport);
      }

      //入力エラーがなかったら登録処理を実行
      if(!errorFlag) {
          //登録用オブジェクトの内容をcount番号のlocalStorageへ上書き保存
          localStorage.setItem(
            'live' + count,
            JSON.stringify(item)
          );
          //登録後、一覧画面へ遷移
          var itemYear = item.date.slice(0, 4);
          document.querySelector('#myNavigator').resetToPage('list.html',{data: {year: itemYear}});
          //console.log('OK');
      } else {
        //入力エラーがあったら、ページ最上部へアンカー移動
        location.href = '#error';
      }

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

    // 遷移時に受け取ったライブIDとアーティストIDをカウント番号に代入
    var liveId = page.data.live;
    var artistId = page.data.artist;

    // その番号のデータを取り出してitemオブジェクトへ一次保存
    item = JSON.parse(
      localStorage.getItem(liveId)
    );

    var dataSetlistNum = Object.keys(item.artists[artistId].setlist).length;

    //セットリストが1つ以上登録されていたら、1つ目の入力欄に値を挿入
    if (dataSetlistNum > 0) {
      $('track0').value = item.artists[artistId].setlist.track0;
    }

    if(dataSetlistNum > 1) {
      for(var i=1; i<dataSetlistNum; i++) {
        var currentTrackInput = document.getElementsByClassName('setlist')[i-1];
        var trackAddButton = currentTrackInput.parentNode.nextElementSibling.firstElementChild.firstElementChild;
        var trackAddButton2 = currentTrackInput.parentNode.nextElementSibling.firstElementChild.firstElementChild.nextElementSibling;
        //次の番号のセットリスト欄と「+」「-」ボタンを生成し、一つ前のセットリストの下段に挿入
        var nextTrackForm = document.createElement('li');
        nextTrackForm.setAttribute('class', 'list-item');
        nextTrackForm.innerHTML = '<div class="list-item__center"><input type="text" class="text-input setlist" id="track' + i + '" placeholder="TRACK' + (i + 1) + '"></div><div class="list-item__right"><div class="list-item__label"><ons-icon icon="md-plus" size="20px" class="icon--tappable" onclick="trackInputAdd(this);"></ons-icon><ons-icon icon="md-minus" size="20px" class="icon--tappable" onclick="trackInputDelete(this);"></ons-icon></div></div>';
        currentTrackInput.parentNode.parentNode.parentNode.appendChild(nextTrackForm);
        //一つ前のセットリスト横の「+」ボタンを削除
        currentTrackInput.parentNode.nextElementSibling.firstElementChild.removeChild(trackAddButton);
        //一つ前のセットリスト横の「-」ボタンを削除
        if(trackAddButton2){
          currentTrackInput.parentNode.nextElementSibling.firstElementChild.removeChild(trackAddButton2);
        }
        nextTrackId = 'track' + i;
        nextTrackInput = document.getElementsByClassName('setlist')[i];
        //追加したセットリスト欄に既存の値を入力
        nextTrackInput.value = item.artists[artistId].setlist[nextTrackId];
      }
    }

    page.querySelector('#setlist-resist').onclick = function() {

      //エラーメッセージの要素とその要素数を取得
      var messageNum = document.getElementsByClassName('message-setlist').length;
      var messageList = document.getElementsByClassName('message-setlist');

      //エラーメッセージが表示されていたら最初に全て消す（登録ボタンを複数回御した時の対策）
      if (messageNum > 0) {
          for(var i=0; i<messageNum; i++) {
              $('error-setlist').removeChild(messageList[0]);
          }
      }

      //一曲目のセットリストをフォームの値から代入
      item.artists[artistId].setlist.track0 = $('track0').value;

      //フォームのセットリスト欄を配列として取得
      var allTrackNum = document.getElementsByClassName('setlist').length;
      var trackList = document.getElementsByClassName('setlist');

      //localStorageに保存されているセットリスト一覧を配列として取得
      var dataTrackNum = Object.keys(item.artists[artistId].setlist).length;
      var dataTrackList = Object.keys(item.artists[artistId].setlist);

      //複数のセットリスト欄が表示されている場合、track1以降の値をオブジェクトに代入
      if (allTrackNum > 1) {
        for(var i=1; i<allTrackNum; i++) {
          targetTrackId = trackList[i].id;
          item.artists[artistId].setlist[targetTrackId] = $(targetTrackId).value;
        }
      }

      //セットリスト欄が削除されていたら、削除分のセットリストを登録用オブジェクトから削除
      if (allTrackNum < dataTrackNum) {
        diffTrackNum = dataTrackNum - allTrackNum;
        deleteTrackList = dataTrackList.splice(allTrackNum, diffTrackNum);
        for (var j in deleteTrackList) {
          var deleteTrackId = deleteTrackList[j];
          delete item.artists[artistId].setlist[deleteTrackId];
        }
      }

      //入力エラー用のフラグを設定
      var errorFlag = false;
      var errorArea = $('error-setlist');

      //セットリスト欄の数だけ入力チェックして、未入力だったら、エラー用フラグを立てて、エラーメッセージを表示
      for(var i=0; i<allTrackNum; i++) {
        if(trackList[i].value == '') {
          var errorFlag = true;
          var errorTrack = document.createElement('li');
          errorTrack.setAttribute('class', 'list-item message-setlist');
          errorTrack.innerHTML = '<div class="list-item__center">TRACK' + (i+1) + 'を入力してください。</div>';
          errorArea.appendChild(errorTrack);
        }
      }

      //入力エラーがなかったら登録処理を実行
      if(!errorFlag) {
          //登録用オブジェクトの内容をcount番号のlocalStorageへ上書き保存
          localStorage.setItem(
            liveId,
            JSON.stringify(item)
          );
          //登録後、一覧画面へ遷移
          var itemYear = item.date.slice(0, 4);
          document.querySelector('#myNavigator').resetToPage('list.html',{data: {year: itemYear}});
          //console.log('OK');
      } else {
        //入力エラーがあったら、ページ最上部へアンカー移動
        location.href = '#error-setlist';
      }

    };

    page.querySelector('#setlist-delete').onclick = function() {

      ons.notification.confirm({
        message: 'セットリストを削除してよろしいですか？',
        title: '',
        primaryButtonIndex: 1,
        cancelable: true,
        modifier: 'material',
        callback: function(index) {
            switch(index) {
              case 1:
                //該当のアーティストのセットリストを初期化
                item.artists[artistId].setlist = {};
                //登録用オブジェクトの内容をcount番号のlocalStorageへ上書き保存
                localStorage.setItem(
                  liveId,
                  JSON.stringify(item)
                );
                //ライブ一覧ページを再読み込み
                var itemYear = item.date.slice(0, 4);
                document.querySelector('#myNavigator').resetToPage('list.html',{data: {year: itemYear}});
                break;
            }
        }
      });

    };

  } else if (page.id === 'member') {

    // 遷移時に受け取ったライブIDとアーティストIDをカウント番号に代入
    var liveId = page.data.live;
    var artistId = page.data.artist;

    // その番号のデータを取り出してitemオブジェクトへ一次保存
    item = JSON.parse(
      localStorage.getItem(liveId)
    );

    var dataMemberNum = Object.keys(item.artists[artistId].members).length;
    //メンバーが1つ以上登録されていたら、1つ目の入力欄に値を挿入
    if (dataMemberNum > 0) {
      $('part0').value = item.artists[artistId].members.member0.part;
      $('member0').value = item.artists[artistId].members.member0.name;
    }
    if(dataMemberNum > 1) {
      for(var i=1; i<dataMemberNum; i++) {
        var currentMemberInput = document.getElementsByClassName('member')[i-1];
        var memberAddButton = currentMemberInput.parentNode.nextElementSibling.firstElementChild.firstElementChild;
        var memberAddButton2 = currentMemberInput.parentNode.nextElementSibling.firstElementChild.firstElementChild.nextElementSibling;
        //次の番号のメンバー欄と「+」「-」ボタンを生成し、一つ前のメンバーの下段に挿入
        var nextMemberForm = document.createElement('li');
        nextMemberForm.setAttribute('class', 'list-item');
        nextMemberForm.innerHTML = '<div class="list-item__left list-item__left--livelog"><input type="text" class="text-input text-input--half part" id="part' + i + '" placeholder="PART' + (i + 1) + '"></div><div class="list-item__center"><input type="text" class="text-input text-input--half2 member" id="member' + i + '" placeholder="MEMBER' + (i + 1) + '"></div><div class="list-item__right"><div class="list-item__label"><ons-icon icon="md-plus" size="20px" class="icon--tappable" onclick="memberInputAdd(this);"></ons-icon><ons-icon icon="md-minus" size="20px" class="icon--tappable" onclick="memberInputDelete(this);"></ons-icon></div></div>';
        currentMemberInput.parentNode.parentNode.parentNode.appendChild(nextMemberForm);
        //一つ前のメンバー横の「+」ボタンを削除
        currentMemberInput.parentNode.nextElementSibling.firstElementChild.removeChild(memberAddButton);
        //一つ前のメンバー横の「-」ボタンを削除
        if(memberAddButton2){
          currentMemberInput.parentNode.nextElementSibling.firstElementChild.removeChild(memberAddButton2);
        }
        var nextMemberId = 'member' + i;
        var nextPartId = 'part' + i;
        var nextMemberInput = document.getElementsByClassName('member')[i];
        var nextPartInput = document.getElementsByClassName('part')[i];
        //追加したメンバー欄に既存の値を入力
        nextPartInput.value = item.artists[artistId].members[nextMemberId].part;
        nextMemberInput.value = item.artists[artistId].members[nextMemberId].name;
      }
    }

    page.querySelector('#member-resist').onclick = function() {

      //エラーメッセージの要素とその要素数を取得
      var messageNum = document.getElementsByClassName('message-member').length;
      var messageList = document.getElementsByClassName('message-member');

      //エラーメッセージが表示されていたら最初に全て消す（登録ボタンを複数回御した時の対策）
      if (messageNum > 0) {
          for(var i=0; i<messageNum; i++) {
              $('error-member').removeChild(messageList[0]);
          }
      }

      //フォームのメンバー欄を配列として取得
      var allMemberNum = document.getElementsByClassName('member').length;
      var memberList = document.getElementsByClassName('member');

      //localStorageに保存されているメンバー一覧を配列として取得
      var dataMemberNum = Object.keys(item.artists[artistId].members).length;
      var dataMemberList = Object.keys(item.artists[artistId].members);

      if (!item.artists[artistId].members.member0) {
        item.artists[artistId].members.member0 = {};
      }

      //一人目のメンバーをフォームの値から代入
      item.artists[artistId].members.member0.part = $('part0').value;
      item.artists[artistId].members.member0.name = $('member0').value;

      //複数のメンバー欄が表示されている場合、member1以降の値をオブジェクトに代入
      if (allMemberNum > 1) {
        for(var i=1; i<allMemberNum; i++) {
          var targetMemberId = memberList[i].id;
          var targetPartId =  memberList[i].id.replace('member', 'part');
          if (!item.artists[artistId].members[targetMemberId]) {
            item.artists[artistId].members[targetMemberId] = {};
          }
          item.artists[artistId].members[targetMemberId].part = $(targetPartId).value;
          item.artists[artistId].members[targetMemberId].name = $(targetMemberId).value;
        }
      }

      //メンバー欄が削除されていたら、削除分のメンバーを登録用オブジェクトから削除
      if (allMemberNum < dataMemberNum) {
        var diffMemberNum = dataMemberNum - allMemberNum;
        var deleteMemberList = dataMemberList.splice(allMemberNum, diffMemberNum);
        for (var j in deleteMemberList) {
          var deleteMemberId = deleteMemberList[j];
          delete item.artists[artistId].members[deleteMemberId];
        }
      }

      //入力エラー用のフラグを設定
      var errorFlag = false;
      var errorArea = $('error-member');

      //セットリスト欄の数だけ入力チェックして、未入力だったら、エラー用フラグを立てて、エラーメッセージを表示
      for(var i=0; i<allMemberNum; i++) {
        var targetMemberId = memberList[i].id;
        var targetPartId =  memberList[i].id.replace('member', 'part');
        if($(targetPartId).value == '') {
          var errorFlag = true;
          var errorPart = document.createElement('li');
          errorPart.setAttribute('class', 'list-item message-member');
          errorPart.innerHTML = '<div class="list-item__center">PART' + (i+1) + 'を入力してください。</div>';
          errorArea.appendChild(errorPart);
        }
        if($(targetMemberId).value == '') {
          var errorFlag = true;
          var errorMember = document.createElement('li');
          errorMember.setAttribute('class', 'list-item message-member');
          errorMember.innerHTML = '<div class="list-item__center">MEMBER' + (i+1) + 'を入力してください。</div>';
          errorArea.appendChild(errorMember);
        }
      }

      //入力エラーがなかったら登録処理を実行
      if(!errorFlag) {
          //登録用オブジェクトの内容をcount番号のlocalStorageへ上書き保存
          localStorage.setItem(
            liveId,
            JSON.stringify(item)
          );
          //登録後、一覧画面へ遷移
          var itemYear = item.date.slice(0, 4);
          document.querySelector('#myNavigator').resetToPage('list.html',{data: {year: itemYear}});
          //console.log('OK');
      } else {
        //入力エラーがあったら、ページ最上部へアンカー移動
        location.href = '#error-member';
      }

    };

    page.querySelector('#member-delete').onclick = function() {

      ons.notification.confirm({
        message: 'メンバーを削除してよろしいですか？',
        title: '',
        primaryButtonIndex: 1,
        cancelable: true,
        modifier: 'material',
        callback: function(index) {
            switch(index) {
              case 1:
                //該当のアーティストのセットリストを初期化
                item.artists[artistId].members = {};
                //登録用オブジェクトの内容をcount番号のlocalStorageへ上書き保存
                localStorage.setItem(
                  liveId,
                  JSON.stringify(item)
                );
                //ライブ一覧ページを再読み込み
                var itemYear = item.date.slice(0, 4);
                document.querySelector('#myNavigator').resetToPage('list.html',{data: {year: itemYear}});
                break;
            }
        }
      });

    };

  } else if (page.id === 'export') {

    //☆localStorageにデータが登録されていたらエクスポート用のリンクを表示する処理
    if(localStorage.length > 0) {

      //localStorageのkeyを格納する配列を生成
      var key = new Array();
      //エクスポート用のデータを格納する連想配列を生成
      var saveData = {};

      //localStorageの全データをsaveDataオブジェクトに格納
      for(var i=0; i<localStorage.length; i++) {

        key[i] = localStorage.key(i);
        saveData[key[i]] = JSON.parse(
          localStorage.getItem(key[i])
        );

      }

      //saveDataオブジェクトを整形済みのJSON文字列に変換
      var saveData = JSON.stringify(saveData, null , "\t");

      //テキストエリアにエクスポート用データを挿入
      $('copyArea').value = saveData;

    } else {

      $('copyArea').value = 'ライブが登録されていません。';

    }

    page.querySelector('#copy-button').onclick = function() {

      var copyArea = $('copyArea');
      clipboardCopy(copyArea);

      ons.notification.alert({
        message: 'クリップボードにコピーしました。',
        title: '',
        buttonLabel: 'OK',
        modifier: 'material',
      });

    };

  } else if (page.id === 'import') {

    page.querySelector('#import-button').onclick = function() {

      if ($('import-input').value == '') {

        ons.notification.alert({
          message: 'データを入力してください。',
          title: '',
          buttonLabel: 'OK',
          modifier: 'material',
        });

      } else {

        try{

          var loadData = JSON.parse($('import-input').value);

          //オブジェクトに登録されているデータの個数を取得
          var loadDataNum = Object.keys(loadData).length;
          //localStorageのkeyを格納するための配列を生成
          var key = Object.keys(loadData);
          //localStorageのvalueを格納するための配列を生成
          var value = Object.keys(loadData).map(function(key) {
              return loadData[key];
          });

          //JSONチェック用の関数にkey, valueを渡して結果を変数に代入
          var checkImport = jsonCheck(key, value);

          if(!checkImport) {
            //falseが返ってきたら、読み込みを中止し、エラーメッセージを表示する
            displayError();
          } else {
            //trueが返ってきたら、インポートを実行する

            //インポートする前にlocalStorageの中身を全削除
            window.localStorage.clear();
            //オブジェクトから読み取ったKey-ValueをlocalStorageへ保存
            for(var i=0; i<loadDataNum; i++) {
              localStorage.setItem(
                key[i],
                JSON.stringify(value[i])
              );
            }
            displayResult();

          }

        }catch(e){

          displayError();
          console.log(e);
          //$('error').firstElementChild.firstElementChild.innerText = e;

        }

      }

    };

  } else if (page.id === 'summary') {

    //☆localStorageにデータが登録されていたら集計結果を表示する処理
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
      //ObjArraySort2(allItem, 'dateOpen', 'desc', 'dateStart', 'desc');

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
      var minYear = Math.min.apply(null, yearList);

      //現在の年を取得
      var now = new Date();
      var currentYear = now.getFullYear();

      if (page.data.year) {
        //年パラメータが指定されていたら、それをselectedYearにする
        var selectedYear = page.data.year;
      } else {
        if (yearList.indexOf(String(currentYear)) >= 0){
          //yearListに今年が含まれている時、今年をselectedYearにする
          var selectedYear = currentYear;
        } else {
          //yearListに今年が含まれていない時
          if (minYear > currentYear) {
            //yearListの最小値が今年より大きい時、最小値をselectedYearにする
            var selectedYear = minYear;
          } else {
            if (maxYear < currentYear) {
              //yearListの最大値が今年より小さい時、最大値をselectedYearにする
              var selectedYear = maxYear;
            } else {
              //yearListの最大値が今年より大きい時、今年より大きな値のみ抽出し、その最小値をselectedYearにする
              var futureList = yearList.filter(function (element) {
                return element > currentYear;
              });
              var selectedYear = Math.min.apply(null, futureList);
            }
          }
        }
      }

      //年のプルダウンを格納するためのセレクトボックスを生成
      var yearSelect = document.createElement('ons-select');
      yearSelect.setAttribute('class', 'select--livelog');
      yearSelect.setAttribute('id', 'select-summary-year');
      yearSelect.setAttribute('onChange', 'changeSummaryYear(this);');
      $('summary-title').appendChild(yearSelect);

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

      //選択中の年のデータから「参加済」のものだけ抽出
      var currentItem = currentItem.filter(function(item, index){
        if ((item.attendance).indexOf('参加済') >= 0) return true;
      });

      //トータルのライブ参加本数を取得
      var totalCount = currentItem.length;

      //トータルのライブ参加本数を表示
      var totalSumaryList = document.createElement('ul');
      totalSumaryList.setAttribute('class', 'list');
      totalSumaryList.innerHTML = '<li class="list-item"><div class="list-item__center"><div class="list-item__label">ライブ参加本数</div></div><div class="list-item__right">' + totalCount + '</div></li></ul>';
      $('summary-content').appendChild(totalSumaryList);

      //参加済ライブの全ジャンルを格納する配列を作成
      var totalGenreList = new Array();

      //各ライブに登録されているジャンル名を格納
      for(var i=0; i<currentItem.length; i++) {
        totalGenreList[i] = currentItem[i].genre;
      }

      //全ジャンルの重複数をカウントする配列を作成
      var totalGenreCounts = {};

      //{ジャンル名:重複数}の形で値を格納
      for(var i=0;i< totalGenreList.length;i++) {
        var key = totalGenreList[i];
        if (totalGenreList[i] != '') {
          totalGenreCounts[key] = (totalGenreCounts[key])? totalGenreCounts[key] + 1 : 1 ;
        }
      }
 
      if (Object.keys(totalGenreCounts).length > 0) {

        //ジャンルとその件数をランキング形式で格納する連想配列を作成
        var totalGenreRank = [];
  
        //{name:ジャンル名, count:件数}の形で値を格納
        for(var i=0;i< Object.keys(totalGenreCounts).length;i++) {
          totalGenreRank[i] = {};
          totalGenreRank[i].name = Object.keys(totalGenreCounts)[i];
          totalGenreRank[i].count = Object.values(totalGenreCounts)[i];
        }

        //countを第1キー、nameを第2キーとしてtotalGenreRankを降順にソート
        ObjArraySort2(totalGenreRank, 'count', 'desc', 'name', 'desc');

        //ジャンル別サマリーのタイトルを表示
        var genreSummaryTitle = document.createElement('div');
        genreSummaryTitle.setAttribute('class', 'list-title');
        genreSummaryTitle.innerText = 'GENRE';
        $('summary-content').appendChild(genreSummaryTitle);

        //ジャンル別サマリーのリストを表示
        var genreSummaryList = document.createElement('ul');
        genreSummaryList.setAttribute('class', 'list');
        $('summary-content').appendChild(genreSummaryList);

        //ジャンル別ランキングを表示
        for(var i=0;i< totalGenreRank.length;i++) {
          genreSummaryList.innerHTML += '<li class="list-item"><div class="list-item__center"><div class="list-item__label">' + totalGenreRank[i].name + '</div></div><div class="list-item__right">' + totalGenreRank[i].count + '</div></li>';
        }

      }

      if (totalCount > 0) {

        //参加済ライブの全アーティストを格納する配列を作成
        var totalArtistList = new Array();

        for(var i=0; i<currentItem.length; i++) {
          
          //各ライブに登録されているアーティストの数を取得
          var eachArtistsNum = Object.keys(currentItem[i].artists).length;

          //各ライブに登録されているアーティスト一覧を格納する配列を作成
          var eachArtistList = new Array();

          //各ライブに登録されているアーティスト一覧をeachArtistListに格納
          for(var j=0; j<eachArtistsNum; j++) {
            var eachArtistId = 'artist' + j;
            eachArtistList[j] = currentItem[i].artists[eachArtistId].name;
          }

          //各ライブ毎に抽出したアーティスト一覧をtotalArtistListに結合
          Array.prototype.push.apply(totalArtistList, eachArtistList);

        }

        //全アーティストの重複数をカウントする配列を作成
        var totalArtistCounts = {};

        //{アーティスト名:重複数}の形で値を格納
        for(var i=0;i< totalArtistList.length;i++) {
          var key = totalArtistList[i];
          totalArtistCounts[key] = (totalArtistCounts[key])? totalArtistCounts[key] + 1 : 1 ;
        }

        // アーティストとその件数をランキング形式で格納する連想配列を作成
        var totalArtistRank = [];

        //{name:ジャンル名, count:件数}の形で値を格納
        for(var i=0;i< Object.keys(totalArtistCounts).length;i++) {
          totalArtistRank[i] = {};
          totalArtistRank[i].name = Object.keys(totalArtistCounts)[i];
          totalArtistRank[i].count = Object.values(totalArtistCounts)[i];
        }

        //countを第1キー、nameを第2キーとしてtotalArtistRankをソート
        ObjArraySort2(totalArtistRank, 'count', 'desc', 'name', 'asc');

        //アーティスト別サマリーのタイトルを表示
        var artistSummaryTitle = document.createElement('div');
        artistSummaryTitle.setAttribute('class', 'list-title');
        artistSummaryTitle.innerText = 'ARTIST';
        $('summary-content').appendChild(artistSummaryTitle);

        //アーティスト別サマリーのリストを表示
        var artistSummaryList = document.createElement('ul');
        artistSummaryList.setAttribute('class', 'list');
        $('summary-content').appendChild(artistSummaryList);

        //アーティスト別サマリーのリピート領域を作成
        var artistSummaryRepeat = document.createElement('ons-lazy-repeat');
        artistSummaryRepeat.setAttribute('id', 'artist-summary-list');
        artistSummaryList.appendChild(artistSummaryRepeat);

        var infiniteList2 = artistSummaryRepeat;

        //アーティスト別ランキングを表示
        infiniteList2.delegate = {
          createItemContent: function(i) {

            return ons.createElement('<li class="list-item"><div class="list-item__center"><div class="list-item__label">' + totalArtistRank[i].name + '</div></div><div class="list-item__right">' + totalArtistRank[i].count + '</div></li>');

          },
          countItems: function() {
            return totalArtistRank.length;
          }
        };

      }

    } else {
      //データが登録されていなかったら文言を表示
      $('summary-title').innerHTML = 'SUMMARY';
      $('summary-content').innerHTML = '<ons-list><ons-list-item><div class="center">ライブが登録されていません。</div></ons-list-item></ons-list>';
    }

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

//☆ライブ一覧で年のプルダウンを選択した時の処理
function changeYear(obj){
  document.querySelector('#myNavigator').resetToPage('list.html', {data: {year: obj.value}});
}

//☆データ集計で年のプルダウンを選択した時の処理
function changeSummaryYear(obj){
  document.querySelector('#myNavigator2').resetToPage('summary.html', {data: {year: obj.value}});
}

//☆アーティストの「+」ボタンが押された時の処理
function artistInputAdd(obj) {
  var currentInputId = obj.parentNode.parentNode.previousElementSibling.firstElementChild.getAttribute('id');
  var currentArtistNum = Number(currentInputId.replace('artist-input', ''));
  //次の番号のアーティスト欄と「+」と「-」ボタンを生成し、下の段に挿入
  var nextArtistInput = document.createElement('ul');
  nextArtistInput.setAttribute('class', 'list');
  nextArtistInput.innerHTML = '<li class="list-item"><div class="list-item__center"><input type="text" class="text-input artist-input" id="artist-input' + (currentArtistNum + 1) + '" placeholder="ARTIST' + (currentArtistNum + 2) + '"></div><div class="list-item__right"><div class="list-item__label"><ons-icon icon="md-plus" size="20px" class="icon--tappable" onclick="artistInputAdd(this);"></ons-icon><ons-icon icon="md-minus" size="20px" class="icon--tappable" onclick="artistInputDelete(this);"></ons-icon></div></li>';
  obj.parentNode.parentNode.parentNode.parentNode.parentNode.appendChild(nextArtistInput);
  //2回目以降については「+」ボタンの右横の「-」ボタンも削除する
  var currentInputDelete = obj.nextElementSibling;
  if (currentInputDelete){
    obj.parentNode.removeChild(currentInputDelete);
  }
  //クリックされた「+」ボタン自体を削除する
  obj.parentNode.removeChild(obj);
}

//☆アーティストの「-」ボタンが押された時の処理
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

//☆セットリストの「+」ボタンが押された時の処理
function trackInputAdd(obj) {
  var currentInputId = obj.parentNode.parentNode.previousElementSibling.firstElementChild.getAttribute('id');
  var currentTrackNum = Number(currentInputId.replace('track', ''));
  //次の番号の入力欄と「+」「-」ボタンを生成し、下の段に挿入
  var nextTrackInput = document.createElement('li');
  nextTrackInput.setAttribute('class', 'list-item');
  nextTrackInput.innerHTML = '<div class="list-item__center"><input type="text" class="text-input setlist" id="track' + (currentTrackNum + 1) + '" placeholder="TRACK' + (currentTrackNum + 2) + '"></div><div class="list-item__right"><div class="list-item__label"><ons-icon icon="md-plus" size="20px" class="icon--tappable" onclick="trackInputAdd(this);"></ons-icon><ons-icon icon="md-minus" size="20px" class="icon--tappable" onclick="trackInputDelete(this);"></ons-icon></div></div>';
  obj.parentNode.parentNode.parentNode.parentNode.appendChild(nextTrackInput);
  //2回目以降については「+」ボタンの右横の「-」ボタンも削除する
  var currentInputDelete = obj.nextElementSibling;
  if (currentInputDelete){
    obj.parentNode.removeChild(currentInputDelete);
  }
  //クリックされた「+」ボタン自体は削除する
  obj.parentNode.removeChild(obj);
}

//☆セットリストの「-」ボタンが押された時の処理
function trackInputDelete(obj) {
  var currentInputId = obj.parentNode.parentNode.previousElementSibling.firstElementChild.getAttribute('id');
  var currentTrackNum = Number(currentInputId.replace('track', ''));
  //1個前のセットリスト入力欄の隣に「+」ボタンを追加
  var previousTrackInput = obj.parentNode.parentNode.parentNode.previousElementSibling;
  var previousTrackButton1 = document.createElement('ons-icon');
  previousTrackButton1.setAttribute('icon', 'md-plus');
  previousTrackButton1.setAttribute('size', '20px');
  previousTrackButton1.setAttribute('class', 'icon--tappable');
  previousTrackButton1.setAttribute('onclick', 'trackInputAdd(this);');
  previousTrackInput.getElementsByTagName('div')[2].appendChild(previousTrackButton1);
  //1個前のセットリスト入力欄の隣に「-」ボタンを追加（最初の入力欄の時は追加しない）
  if (currentTrackNum > 1) {
    var previousTrackButton2 = document.createElement('ons-icon');
    previousTrackButton2.setAttribute('icon', 'md-minus');
    previousTrackButton2.setAttribute('size', '20px');
    previousTrackButton2.setAttribute('class', 'icon--tappable');
    previousTrackButton2.setAttribute('onclick', 'trackInputDelete(this);');
    previousTrackInput.getElementsByTagName('div')[2].appendChild(previousTrackButton2);
  }
  //該当のセットリスト入力欄を削除
  var currentTrackInput = obj.parentNode.parentNode.parentNode;
  obj.parentNode.parentNode.parentNode.parentNode.removeChild(currentTrackInput);
}

//☆メンバーの「+」ボタンが押された時の処理
function memberInputAdd(obj) {
  var currentInputId = obj.parentNode.parentNode.previousElementSibling.firstElementChild.getAttribute('id');
  var currentMemberNum = Number(currentInputId.replace('member', ''));
  //次の番号の入力欄と「+」ボタンを生成し、下の段に挿入
  var nextMemberInput = document.createElement('li');
  nextMemberInput.setAttribute('class', 'list-item');
  nextMemberInput.innerHTML = '<div class="list-item__left list-item__left--livelog"><input type="text" class="text-input text-input--half part" id="part' + (currentMemberNum + 1) + '" placeholder="PART' + (currentMemberNum + 2) + '"></div><div class="list-item__center"><input type="text" class="text-input text-input--half2 member" id="member' + (currentMemberNum + 1) + '" placeholder="MEMBER' + (currentMemberNum + 2) + '"></div><div class="list-item__right"><div class="list-item__label"><ons-icon icon="md-plus" size="20px" class="icon--tappable" onclick="memberInputAdd(this);"></ons-icon><ons-icon icon="md-minus" size="20px" class="icon--tappable" onclick="memberInputDelete(this);"></ons-icon></div></div>';
  obj.parentNode.parentNode.parentNode.parentNode.appendChild(nextMemberInput);
  //2回目以降については「+」ボタンの右横の「-」ボタンも削除する
  var currentInputDelete = obj.nextElementSibling;
  if (currentInputDelete){
    obj.parentNode.removeChild(currentInputDelete);
  }
  //クリックされた「+」ボタン自体は削除する
  obj.parentNode.removeChild(obj);
}

//☆メンバーの「-」ボタンが押された時の処理
function memberInputDelete(obj) {
  var currentInputId = obj.parentNode.parentNode.previousElementSibling.firstElementChild.getAttribute('id');
  var currentMemberNum = Number(currentInputId.replace('member', ''));
  //1個前のメンバー入力欄の隣に「+」ボタンを追加
  var previousMemberInput = obj.parentNode.parentNode.parentNode.previousElementSibling;
  var previousMemberButton1 = document.createElement('ons-icon');
  previousMemberButton1.setAttribute('icon', 'md-plus');
  previousMemberButton1.setAttribute('size', '20px');
  previousMemberButton1.setAttribute('class', 'icon--tappable');
  previousMemberButton1.setAttribute('onclick', 'memberInputAdd(this);');
  previousMemberInput.getElementsByTagName('div')[3].appendChild(previousMemberButton1);
  //1個前のセットリスト入力欄の隣に「-」ボタンを追加（最初の入力欄の時は追加しない）
  if (currentMemberNum > 1) {
    var previousMemberButton2 = document.createElement('ons-icon');
    previousMemberButton2.setAttribute('icon', 'md-minus');
    previousMemberButton2.setAttribute('size', '20px');
    previousMemberButton2.setAttribute('class', 'icon--tappable');
    previousMemberButton2.setAttribute('onclick', 'memberInputDelete(this);');
    previousMemberInput.getElementsByTagName('div')[3].appendChild(previousMemberButton2);
  }
  //該当のメンバー入力欄を削除
  var currentMemberInput = obj.parentNode.parentNode.parentNode;
  obj.parentNode.parentNode.parentNode.parentNode.removeChild(currentMemberInput);
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

//☆JSONのフォーマットをチェックする関数
function jsonCheck(key, value) {

  //エラー用のフラグを初期化
  var errorFlag = false;

  //読み込んだデータのkeyが「live0, live1, live2...」の形式かどうかチェックし、間違った形式が含まれていたらエラー用フラグを立てる
  keyFormat = new RegExp('^(live)([0-9]*)$');
  for(var i=0; i<key.length; i++) {
    if (!keyFormat.test(key[i])) {
      var errorFlag = true;
    }
  }

  //チェック用の正しいkey一覧を配列として定義
  var keyList = ['address', 'adv', 'area', 'artists', 'attendance', 'date', 'door', 'genre', 'id', 'info', 'memo', 'open', 'place', 'report', 'start', 'ticket', 'title', 'type'];
  var artistKeyList = ['members', 'name', 'setlist'];
  var memberKeyList = ['name', 'part'];

  for(var i=0; i<value.length; i++) {

    //登録されているデータのkey一覧をチェックし、項目に過不足があったらエラー用フラグを立てる
    var checkKeys = Object.keys(value[i]).sort();
    if (checkKeys.toString() !== keyList.toString()) {
      var errorFlag = true;
    }

    //各keyの値から番号だけを取り出す
    var checkId = key[i].replace('live', '');

    //keyとidの番号が違っていたら、エラー用フラグを立てる
    if (value[i].id.toString() !== checkId) {
      var errorFlag = true;
    }

    //各データのartistsのkey一覧を配列として取得
    var checkArtistKeys = Object.keys(value[i].artists).sort();

    //正しいartistsのkey一覧を格納する配列を生成
    var artistLabels = new Array();

    //checkArtistKeysの長さの分だけ「artist0, artist1, artist2...」の形式で値を格納
    for(var j=0; j<checkArtistKeys.length; j++) {
      artistLabels[j] = 'artist' + j;
    }

    //正しいartistsのkey一覧をソート
    var artistLabels = artistLabels.sort();

    //artistsのkeyの一覧が「artist0, artist1, artist2...」の形式と違っていたら、エラー用フラグを立てる
    if (checkArtistKeys.toString() !== artistLabels.toString()) {
      var errorFlag = true;
    }

    //各データのartist内の配列を取得
    var artist = Object.keys(value[i].artists).map(function(key) {
        return value[i].artists[key];
    });

    //各データのartists内の項目チェック
    for (obj in artist) {

      //登録されているデータのartistsのkey一覧をチェックし、項目に過不足があったらエラー用フラグを立てる
      var artistKeys = Object.keys(artist[obj]).sort();
      if (artistKeys.toString() !== artistKeyList.toString()) {
        var errorFlag = true;
      }

      //artists内のsetlistオブジェクトを取得
      var setlist = artist[obj].setlist;
      var setlistKeys = Object.keys(setlist).sort();

      var setlistValues = Object.keys(setlist).map(function(key) {
          return setlist[key];
      });

      if (!setlistValues.length) {

      } else {

        //正しいsetlistのkey一覧を格納する配列を生成
        var setlistLabels = new Array();

        //setlistKeysの長さの分だけ「track0, track1, track2...」の形式で値を格納
        for(var j=0; j<setlistKeys.length; j++) {
          setlistLabels[j] = 'track' + j;
        }
        setlistLabels.sort();

        //setlistのkeyの一覧が「track0, track1, track2...」の形式と違っていたら、エラー用フラグを立てる
        if (setlistKeys.toString() !== setlistLabels.toString()) {
          var errorFlag = true;
        }

      }

      //artists内のmembersオブジェクトを取得
      var members = artist[obj].members;
      var membersKeys = Object.keys(members).sort();

      var memberValues = Object.keys(members).map(function(key) {
          return members[key];
      });

      if (!memberValues.length) {

      } else {

        //正しいmembersのkey一覧を格納する配列を生成
        var memberLabels = new Array();

        //membersKeysの長さの分だけ「member0, member1, member2...」の形式で値を格納
        for(var j=0; j<membersKeys.length; j++) {
          memberLabels[j] = 'member' + j;
        }
        memberLabels.sort();

        //membersのkeyの一覧が「member0, member1, member2...」の形式と違っていたら、エラー用フラグを立てる
        if (membersKeys.toString() !== memberLabels.toString()) {
          var errorFlag = true;
        }

      }

      for (obj2 in memberValues) {
        //members内のkeyの一覧を取得
        var memberKeys = Object.keys(memberValues[obj2]).sort();
        //登録されているデータのmembersのkey一覧をチェックし、項目に過不足があったらエラー用フラグを立てる
        if (memberKeys.toString() !== memberKeyList.toString()) {
          var errorFlag = true;
        }
      }

    }

    //titleが空文字（未入力）だったらエラー用フラグを立てる
    if (!value[i].title.length) {
      var errorFlag = true;
    }

    //日付の型チェックをして戻り値を変数に格納
    var dateFormat = ckDate(value[i].date);

    if (!value[i].date.length) {
      //dateが空文字（未入力）だったらエラー用フラグを立てる
      var errorFlag = true;
    } else if (!dateFormat) {
      //dateのフォーマットが不正だったら、エラー用フラグを立てる
      var errorFlag = true;
    }

    //時間の型チェックをして戻り値を変数に格納
    var openFormat = ckTime(value[i].open);
    var startFormat = ckTime(value[i].start);

    if (!value[i].open.length) {
    } else if (!openFormat) {
      //openが入力されていて、かつフォーマットが不正の場合は、エラー用フラグを立てる
      var errorFlag = true;
    }

    if (!value[i].start.length) {
    } else if (!startFormat) {
      //startが入力されていて、かつフォーマットが不正の場合は、エラー用フラグを立てる
      var errorFlag = true;
    }

    //URLの型チェックをして戻り値を変数に格納
    var infoFormat = isUrl(value[i].info);
    var reportFormat = isUrl(value[i].report);

    if (!value[i].info.length) {
    } else if (!infoFormat) {
      //infoが入力されていて、かつフォーマットが不正の場合は、エラー用フラグを立てる
      var errorFlag = true;
    }

    if (!value[i].report.length) {
    } else if (!reportFormat) {
      //reportが入力されていて、かつフォーマットが不正の場合は、エラー用フラグを立てる
      var errorFlag = true;
    }

  }

  if (!errorFlag) {
    //エラー用フラグが立ってなかったら、trueを返す
    return true;
  } else {
    //エラー用フラグが立っていたら、falseを返す
    return false;
  }

}

//☆読み込み完了した時に結果を表示する関数
function displayResult() {
  ons.notification.alert({
    message: 'データが正常に読み込まれました。',
    title: '',
    buttonLabel: 'OK',
    modifier: 'material',
    callback: function() {
      fn.load('home.html');
    }
  });
}

//☆読み込み失敗した時にエラーを表示する関数
function displayError() {
  ons.notification.alert({
    message: 'データが正常に読み込まれませんでした。<br>JSONファイルを確認してから再度お試しください。',
    title: '',
    buttonLabel: 'OK',
    modifier: 'material',
  });
}

//☆URLリンクをクリックした時にアプリ内ブラウザを開く関数
function openAppinBrowser(obj) {
  var url = obj.getAttribute('data-url');
  window.open(url, '_system');
};

//☆ライブ一覧のリスト項目をタップしたら該当のライブ詳細を開く関数
function openLiveDetail(obj) {
  var liveId = obj.getAttribute('data-live');
  document.querySelector('#myNavigator').pushPage('detail.html', {data: {live: liveId}});
}

//☆フォーム要素の内容をクリップボードにコピーする関数
function clipboardCopy(element){

  // コピーさせたいテキストの選択
  element.focus();
  element.setSelectionRange(0, 999999);

  // クリップボードにコピー
  document.execCommand('copy');

  // コピーさせたいテキストの選択を解除
  element.blur();
}
