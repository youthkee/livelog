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

  if (page.id === 'list') {
    page.querySelector('#add-button').onclick = function() {
      document.querySelector('#myNavigator').pushPage('edit.html');
    };
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
    page.querySelector('#resist-button').onclick = function() {
      document.querySelector('#myNavigator').popPage({animation: 'fade'});
    };
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