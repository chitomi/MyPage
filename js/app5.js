const API_KEY = 'AIzaSyDqkhXDp4UHEYDuLJNY0E1jZGJ98XSgeNU'; // 地区防災計画研究会のAPI（制限無し）
const SHEET_ID = '1IPnI4RKw0y0ciM-os5EpuDV36BSeCTUE-kwQnSQg5xE'; // 地防研koenスプレッドシート(入力シート)

/*
シートIDは共有URLのhttps://docs.google.com/spreadsheets/d/ここから＊＊＊＊＊＊＊＊＊＊ここまで/edit?usp=sharing
共有設定は「リンクをしっている人全員の閲覧者」以上とします
*/

//-------------------------------背景マップの設定-----------------------------------------
// OpenStreetMap読み込み
let o_std = new L.tileLayer("http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
});


// レイヤ設定
let Map_BaseLayer = {
    "OpenStreetMap": o_std
};


// BaseMap読み込み
let map = L.map("map", {
    center: [35.8618722810502, 139.64535182812597], // 初期マップ中心座標（さいたま市役所）
    zoom: 14, // 初期ズームレベル
    zoomControl: true, // ズームコントロールを表示する
    layers: [o_std] // 初期ベースマップ
});

//－－－－－ここまで背景マップの設定－－－－－－－－－－
// レイヤグループをマップに追加
let koendata = L.layerGroup().addTo(map);
// let Supplies = L.layerGroup().addTo(map);

// 右上のメニューに表示する追加レイヤの設定
let Map_AddLayer = {
    "公園": koendata,
    // "支援物資拠点": Supplies,
};

//－－－－－ここから、それぞれの追加レイヤを取得－－－－－－－－－－
// 空のマーカーオブジェクトを定義する
let marker01 = [];
// let marker02 = [];

// CSV（配列）データを連想配列に解析する
let parseData = (data) => {
  let keys = data.values[0]; // data（配列）の一行目（項目名）の値をkeysに代入
  // console.log(keys);
  let markerData = []; // 連想配列markerDataの定義
  
  // forEachは変数dataの値に対して関数を一回づつ実行する（終了プロセス不要）
  data.values.forEach((value, i) => { // value（要素の値）、i（インデックス番号）を指定、
                                      // array（配列data）は省略
    // console.log(value); // valueは配列
    if (i > 0) { // index[0]は除く（項目名行を除く）
      let hash = {}; // 連想配列hashを定義する
      value.forEach((d, j) => { // 行ごとの要素（d）、index番号（j）
        hash[keys[j]] = d; // 項目名（keys）のj（インデックス番号）にd要素を代入
      });
      // console.log(hash); // hashは連想配列
      markerData.push(hash); // hashを末尾に追加する
    }
  });
   console.log(markerData); // markerDataは連想配列hashをまとめたオブジェクト
  return markerData; // markerDataをプログラムに渡す
}
      
// 左下のサイドバーの設定
let sidebar = L.control({ position: "bottomleft" }); // 画面の左下にDOM表示領域の設定
sidebar.onAdd = (map) => {
  this.ele = L.DomUtil.create('div', "sidebar");
  this.ele.id = "sidebardiv";
  return this.ele;
};
sidebar.addTo(map);

let div = L.DomUtil.get('sidebardiv');
L.DomEvent.disableClickPropagation(div);
L.DomEvent.on(div, 'mousewheel', L.DomEvent.stopPropagation);


// ーーーーーーーーーーーーーースプレッドシートーーーーーーーーーーーーーーー
// 公園シートのデータをfetchで取得
fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/koen?key=${API_KEY}`)
  .then((response) => response.json()) // json形式で取得
  .then((data) => parseData(data)) // 取得した配列データを連想配列に変換
  .then((markerData) => setData01(markerData)); // データをサイドバーおよびレイヤに表示

/*
// 支援物資拠点シート
fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/支援物資拠点?key=${API_KEY}`)
  .then((response) => response.json()) // json形式で取得
  .then((data) => parseData(data)) // 取得した配列データを連想配列に変換
  .then((markerData) => setData02(markerData)); // データをサイドバーおよびレイヤに表示
*/


  // －－－－－－－－－－データをマーカー表示する－－－－－－－－－－－－－
let addMarker01 = (i, data) => {
  // マーカーの座標
  let markerLatLng = L.latLng({
    lat: Number(data['緯度']),
    lng: Number(data['経度'])
  });
  // ポップアップコンテンツを設定する（ポップアップ時にnameデータを表示する）
  let popupContents = '<div style="font-size:18px;font-weight:bold;margin-bottom:10px;">'
   + data['公園名'] + '</div>';
   // console.log(popupContents);
  let popup = L.popup().setContent(popupContents);
  // データの表示：.marker－地理的マーカーデータ、.bindPopup－ポップアップ表示、.on－○○したとき、.addTo－レイヤに追加
  marker01[i] = L.marker(markerLatLng).bindPopup(popup)
  .on('click',function(ele){ map.flyTo(ele.latlng,16); }).addTo(koendata);
  // console.log(popup);
}

// －－－－－－－－－－－サイドバー内の設定－－－－－－－－－－－－－－－
// データをサイドバーに表示する
let setData01 = (markerData) => {
  let sidebar_html = ""; // データをDOM(HTML)で格納する
  for (let i = 0; i < markerData.length; i++) { // iがmarkerData長（行）より短ければ、1プラス
    let latitude = markerData[i]['緯度']; // i行目のmarkerDataのLat値をlatitudeに代入
    if (!latitude) { continue; } // latitudeが偽ならば、ループを中断して次のループへ
    addMarker01(i, markerData[i]); // addMarker関数でmarkerDataを一つずつ表示する
    let name = markerData[i]['公園名']; // i行目のmarkerDataのname値をnameに代入
    sidebar_html += `<b>${i + 1}</b> <a href="javascript:popupOn(${i})">${name}<\/a><br />`;
  }
  document.getElementById("sidebardiv").innerHTML = 
  `<a target="_blank" href=
  "https://docs.google.com/spreadsheets/d/1IPnI4RKw0y0ciM-os5EpuDV36BSeCTUE-kwQnSQg5xE/edit?usp=sharing">
  入力シート</a>` + `<h3>公園イベント情報</h3>`+ sidebar_html;
}
// サイドバーの表示をクリックするとマップにズームインする
let popupOn = (i) => {
  let latlng = marker01[i].getLatLng();
  map.flyTo(latlng, 16); // ズームレベル16
  marker01[i].openPopup();
}
// －－－－－－－－－－－サイドバー内設定ここまで－－－－－－－－－－－－
/*
// ２枚目シート
// マーカーを表示する
let addMarker02 = (i, data) => {
  // マーカーの座標
  let markerLatLng = L.latLng({
    lat: Number(data['Lat']),
    lng: Number(data['Lng'])
  });
  
  // ポップアップコンテンツを設定する
  let popupContents = '<div style="font-size:18px;font-weight:bold;margin-bottom:10px;">'
   + data['Name'] + '</div>';
  let popup = L.popup().setContent(popupContents);

  // データの表示：addtoの変数を変える
  marker02[i] = L.marker(markerLatLng,{riseOnHover: true}).bindPopup(popup)
  .on('click',function(ele){ map.flyTo(ele.latlng,16); }).addTo(Supplies);
}

// データを一行ずつ読み込む関数
let setData02 = (markerData) => {
  for (let i = 0; i < markerData.length; i++) {
    let latitude = markerData[i]['Lat'];
    if (!latitude) { continue; }
    addMarker02(i, markerData[i]);
  }
}
*/

// レイヤーコントロール
L.control.layers(Map_BaseLayer, Map_AddLayer, {
  collapsed: false
}).addTo(map);