const API_KEY = 'AIzaSyDBWNouWzWo_yJXhKAWkyPNYaYm4l9w3kM'; // CDTのAPI（制限無し）
const SHEET_ID = '1gfEVVhD0otPVPtNtX9MKvhgqfG_viJvccWM8BVjC6xg'; // CDTのスプレッドシート(入力シート)

/*
シートIDは共有URLのhttps://docs.google.com/spreadsheets/d/ここから＊＊＊＊＊＊＊＊＊＊ここまで/edit?usp=sharing
共有設定は「リンクをしっている人全員の閲覧者」以上とします
*/

//-------------------------------背景マップの設定-----------------------------------------
// MIERUNE MONO読み込み
let m_mono = new L.tileLayer("https://tile.mierune.co.jp/mierune_mono/{z}/{x}/{y}.png", {
    attribution: "Maptiles by <a href='http://mierune.co.jp/' target='_blank'>MIERUNE</a>, under CC BY. Data by <a href='http://osm.org/copyright' target='_blank'>OpenStreetMap</a> contributors, under ODbL."
});

// 地理院タイル 淡色読み込み
let t_pale = new L.tileLayer("http://cyberjapandata.gsi.go.jp/xyz/pale/{z}/{x}/{y}.png", {
    attribution: "<a href='http://www.gsi.go.jp/kikakuchousei/kikakuchousei40182.html' target='_blank'>国土地理院</a>"
});

// 地理院タイル オルソ読み込み
let t_ort = new L.tileLayer("http://cyberjapandata.gsi.go.jp/xyz/ort/{z}/{x}/{y}.jpg", {
    attribution: "<a href='http://www.gsi.go.jp/kikakuchousei/kikakuchousei40182.html' target='_blank'>国土地理院</a>"
});

// OpenStreetMap読み込み
let o_std = new L.tileLayer("http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
});


// レイヤ設定
let Map_BaseLayer = {
    "MIERUNE MONO": m_mono,
    "地理院タイル 淡色": t_pale,
    "地理院タイル オルソ": t_ort,
    "OpenStreetMap": o_std
};


// BaseMap読み込み
let map = L.map("map", {
    center: [36.035392, 139.755793], // 初期マップ中心座標
    zoom: 14, // 初期ズームレベル
    zoomControl: true, // ズームコントロールを表示する
    layers: [m_mono] // 初期ベースマップ
});

//－－－－－ここまで背景マップの設定－－－－－－－－－－


// レイヤグループをマップに追加
let Refuge = L.layerGroup().addTo(map);
let Supplies = L.layerGroup().addTo(map);
let VCs = L.layerGroup().addTo(map);
let kin = L.layerGroup().addTo(map);
let sai = L.layerGroup().addTo(map);
let dog = L.layerGroup().addTo(map);
let pet = L.layerGroup().addTo(map);
//let VC = L.layerGroup().addTo(map);
//let VC = L.layerGroup().addTo(map);

//let LineAll = L.layerGroup().addTo(map);
//let PolygonAll = L.layerGroup().addTo(map);

// 洪水ハザードのタイルレイヤ、濃度を0.5に設定
let Hazard = L.tileLayer("https://disaportaldata.gsi.go.jp/raster/01_flood_l2_shinsuishin_data/{z}/{x}/{y}.png", {opacity:0.5}).addTo(map);


// 右上のメニューに表示する追加レイヤの設定
let Map_AddLayer = {
    "避難所": Refuge,
    "支援物資拠点": Supplies,
    "VC支援": VCs,
    "緊急医療": kin,
    "彩の国": sai,
    "救助犬": dog,
    "ペット": pet,
    //"ポリライン": LineAll,
    //"ポリゴン": PolygonAll,
    "ハザードマップ": Hazard
};

//－－－－－ここから、それぞれの追加レイヤを取得－－－－－－－－－－
// 空の追加レイヤーを定義する
let marker01 = [];
let marker02 = [];
let marker03 = [];
let marker04 = [];
let marker05 = [];
let marker06 = [];
let marker07 = [];
//let marker08 = [];
//let marker09 = [];
//let marker10 = [];


// CSVデータ解析：オブジェクト（連想配列）の解析
let parseData = (data) => {
  let keys = data.values[0]; // 変数dataオブジェクトの一番目の値をkeysに代入
  let markerData = []; // 空のmarkerDataオブジェクトの定義
  
  // forEachは変数dataの値に対して関数を一回づつ実行する（終了プロセス不要）
  data.values.forEach((value, i) =>  {
    if (i > 0) {
      let hash = {}; // 変数hashブロックを定義する
      value.forEach((d, j) =>  { // 変数valueに対して関数を一回づつ実行する
        hash[keys[j]] = d; // 変数keysのj（インデックス番号）をインデックスとするhash値をdとする
      });
      markerData.push(hash); // 配列の末尾に 1 つ以上の要素を追加することができます。また戻り値として新しい配列の要素数を返します。
    }
  });
  return markerData; // markerDataをプログラムに渡す
}
      
// 左下のサイドバーの設定
let sidebar = L.control({ position: "bottomleft" });
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
// 避難所シート
fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/避難所?key=${API_KEY}`)
  .then((response) => response.json()) // json形式で取得
  .then((data) => parseData(data)) // 取得した配列データを連想配列に変換
  .then((markerData) => setData01(markerData)); // データをサイドバーおよびレイヤに表示

// 支援物資拠点シート
fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/支援物資拠点?key=${API_KEY}`)
  .then((response) => response.json()) // json形式で取得
  .then((data) => parseData(data)) // 取得した配列データを連想配列に変換
  .then((markerData) => setData02(markerData)); // データをサイドバーおよびレイヤに表示

// VC支援シート
fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/VC支援?key=${API_KEY}`)
  .then((response) => response.json()) // json形式で取得
  .then((data) => parseData(data)) // 取得した配列データを連想配列に変換
  .then((markerData) => setData03(markerData)); // データをサイドバーおよびレイヤに表示

// 緊急医療シート
fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/緊急医療?key=${API_KEY}`)
  .then((response) => response.json()) // json形式で取得
  .then((data) => parseData(data)) // 取得した配列データを連想配列に変換
  .then((markerData) => setData04(markerData)); // データをサイドバーおよびレイヤに表示

// 彩の国シート
fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/彩の国?key=${API_KEY}`)
  .then((response) => response.json()) // json形式で取得
  .then((data) => parseData(data)) // 取得した配列データを連想配列に変換
  .then((markerData) => setData05(markerData)); // データをサイドバーおよびレイヤに表示

// 救助犬シート
fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/救助犬?key=${API_KEY}`)
  .then((response) => response.json()) // json形式で取得
  .then((data) => parseData(data)) // 取得した配列データを連想配列に変換
  .then((markerData) => setData06(markerData)); // データをサイドバーおよびレイヤに表示

// ペットシート
fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/ペット?key=${API_KEY}`)
  .then((response) => response.json()) // json形式で取得
  .then((data) => parseData(data)) // 取得した配列データを連想配列に変換
  .then((markerData) => setData07(markerData)); // データをサイドバーおよびレイヤに表示


// －－－－－－－－－－データをマーカー表示する－－－－－－－－－－－－－
let addMarker01 = (i, data) => {
  // マーカーの座標
  let markerLatLng = L.latLng({
    lat: Number(data['Lat']),
    lng: Number(data['Lng'])
  });
  // ポップアップコンテンツを設定する（ポップアップ時にnameデータを表示する）
  let popupContents = '<div style="font-size:18px;font-weight:bold;margin-bottom:10px;">' + data['name'] + '</div>';
  let popup = L.popup().setContent(popupContents);
  // データの表示 
  marker01[i] = L.marker(markerLatLng).bindPopup(popup).on('click',function(ele){ map.flyTo(ele.latlng,16); }).addTo(Refuge);
}

// －－－－－－－－－－－サイドバー内の設定－－－－－－－－－－－－－－－
// データをサイドバーに表示する
let setData01 = (markerData) => {
  let sidebar_html = ""; // データをHTMLで格納する
  for (let i = 0; i < markerData.length; i++) {
    let latitude = markerData[i]['Lat'];
    if (!latitude) { continue; }
    addMarker01(i, markerData[i]); // addMarker関数でmarkerDataを一つずつ表示する
    let name = markerData[i]['name'];
    sidebar_html += `<b>${i + 1}</b> <a href="javascript:popupOn(${i})">${name}<\/a><br />`;
  }
  document.getElementById("sidebardiv").innerHTML = `<a target="_blank" href="https://docs.google.com/spreadsheets/d/1gfEVVhD0otPVPtNtX9MKvhgqfG_viJvccWM8BVjC6xg/edit?usp=sharing">入力シート</a>` + `<h3>避難所</h3>`+ sidebar_html;
}
// サイドバーの表示をクリックするとマップにズームインする
function popupOn(i) {
  let latlng = marker[i].getLatLng();
  map.flyTo(latlng, 16); // ズームレベル16
  marker[i].openPopup();
}
// －－－－－－－－－－－サイドバー内設定ここまで－－－－－－－－－－－－

// 2枚目シート
// マーカーを表示する
let addMarker02 = (i, data) => {
  // マーカーの座標
  let markerLatLng = L.latLng({
    lat: Number(data['Lat']),
    lng: Number(data['Lng'])
  });
  
  // ポップアップコンテンツを設定する
  let popupContents = '<div style="font-size:18px;font-weight:bold;margin-bottom:10px;">' + data['Name'] + '</div>';
  let popup = L.popup().setContent(popupContents);

  // データの表示 （ここのiは区別する）,addtoの変数を変える
  marker02[i] = L.marker(markerLatLng,{riseOnHover: true}).bindPopup(popup).on('click',function(ele){ map.flyTo(ele.latlng,16); }).addTo(Supplies);
}

// データを一行ずつ読み込む関数
let setData02 = (markerData) => {
  for (var i = 0; i < markerData.length; i++) {
    let latitude = markerData[i]['Lat'];
    if (!latitude) { continue; }
    addMarker02(i, markerData[i]);
  }
}

// 3枚目シート
// マーカーを表示する
let addMarker03 = (i, data) => {
  // マーカーの座標
  let markerLatLng = L.latLng({
    lat: Number(data['Lat']),
    lng: Number(data['Lng'])
  });
  
  // ポップアップコンテンツを設定する
  let popupContents = '<div style="font-size:18px;font-weight:bold;margin-bottom:10px;">' + data['Name'] + '</div>';
  let popup = L.popup().setContent(popupContents);

  // データの表示 （ここのiは区別する）,addtoの変数を変える
  marker03[i] = L.marker(markerLatLng,{riseOnHover: true}).bindPopup(popup).on('click',function(ele){ map.flyTo(ele.latlng,16); }).addTo(VCs);
}

// データを一行ずつ読み込む関数
let setData03 = (markerData) => {
  for (var i = 0; i < markerData.length; i++) {
    let latitude = markerData[i]['Lat'];
    if (!latitude) { continue; }
    addMarker03(i, markerData[i]);
  }
}

// 4枚目シート
// マーカーを表示する
let addMarker04 = (i, data) => {
  // マーカーの座標
  let markerLatLng = L.latLng({
    lat: Number(data['Lat']),
    lng: Number(data['Lng'])
  });
  
  // ポップアップコンテンツを設定する
  let popupContents = '<div style="font-size:18px;font-weight:bold;margin-bottom:10px;">' + data['Name'] + '</div>';
  let popup = L.popup().setContent(popupContents);

  // データの表示 （ここのiは区別する）,addtoの変数を変える
  marker04[i] = L.marker(markerLatLng,{riseOnHover: true}).bindPopup(popup).on('click',function(ele){ map.flyTo(ele.latlng,16); }).addTo(kin);
}

// データを一行ずつ読み込む関数
let setData04 = (markerData) => {
  for (var i = 0; i < markerData.length; i++) {
    let latitude = markerData[i]['Lat'];
    if (!latitude) { continue; }
    addMarker04(i, markerData[i]);
  }
}

// 5枚目シート
// マーカーを表示する
let addMarker05 = (i, data) => {
  // マーカーの座標
  let markerLatLng = L.latLng({
    lat: Number(data['Lat']),
    lng: Number(data['Lng'])
  });
  
  // ポップアップコンテンツを設定する
  let popupContents = '<div style="font-size:18px;font-weight:bold;margin-bottom:10px;">' + data['Name'] + '</div>';
  let popup = L.popup().setContent(popupContents);

  // データの表示 （ここのiは区別する）,addtoの変数を変える
  marker05[i] = L.marker(markerLatLng,{riseOnHover: true}).bindPopup(popup).on('click',function(ele){ map.flyTo(ele.latlng,16); }).addTo(sai);
}

// データを一行ずつ読み込む関数
let setData05 = (markerData) => {
  for (var i = 0; i < markerData.length; i++) {
    let latitude = markerData[i]['Lat'];
    if (!latitude) { continue; }
    addMarker05(i, markerData[i]);
  }
}

// 6枚目シート
// マーカーを表示する
let addMarker06 = (i, data) => {
  // マーカーの座標
  let markerLatLng = L.latLng({
    lat: Number(data['Lat']),
    lng: Number(data['Lng'])
  });
  
  // ポップアップコンテンツを設定する
  let popupContents = '<div style="font-size:18px;font-weight:bold;margin-bottom:10px;">' + data['Name'] + '</div>';
  let popup = L.popup().setContent(popupContents);

  // データの表示 （ここのiは区別する）,addtoの変数を変えるdo
  marker06[i] = L.marker(markerLatLng,{riseOnHover: true}).bindPopup(popup).on('click',function(ele){ map.flyTo(ele.latlng,16); }).addTo(dog);
}

// データを一行ずつ読み込む関数
let setData06 = (markerData) => {
  for (var i = 0; i < markerData.length; i++) {
    let latitude = markerData[i]['Lat'];
    if (!latitude) { continue; }
    addMarker06(i, markerData[i]);
  }
}

// 7枚目シート
// マーカーを表示する
let addMarker07 = (i, data) => {
  // マーカーの座標
  let markerLatLng = L.latLng({
    lat: Number(data['Lat']),
    lng: Number(data['Lng'])
  });
  
  // ポップアップコンテンツを設定する
  let popupContents = '<div style="font-size:18px;font-weight:bold;margin-bottom:10px;">' + data['Name'] + '</div>';
  let popup = L.popup().setContent(popupContents);

  // データの表示 （ここのiは区別する）,addtoの変数を変える
  marker07[i] = L.marker(markerLatLng,{riseOnHover: true}).bindPopup(popup).on('click',function(ele){ map.flyTo(ele.latlng,16); }).addTo(pet);
}

// データを一行ずつ読み込む関数
let setData07 = (markerData) => {
  for (var i = 0; i < markerData.length; i++) {
    let latitude = markerData[i]['Lat'];
    if (!latitude) { continue; }
    addMarker07(i, markerData[i]);
  }
}



// レイヤーコントロール
L.control.layers(Map_BaseLayer, Map_AddLayer, {
  collapsed: false
}).addTo(map);