
import * as vscode from 'vscode';

let myStatusBarItem: vscode.StatusBarItem;
export function activate(context: vscode.ExtensionContext) {

    //設定ファイル読み込み
    const config = vscode.workspace.getConfiguration('kaisendon_vscode');
    //アクセストークン、インスタンス取得
    let accessToken = config.get('Access Token');
    let instance = config.get('Instance');
    //設定を読み込む
    var setting_streaming_api = config.get('Streaming API');
    var setting_load_image = config.get('Load Image');
    var setting_dark_mode = config.get('Dark Mode');



    console.log('Congratulations, your extension "kaisendon-vscode" is now active!');

    //Package JSON にもコマンド書いてね
    let disposable = vscode.commands.registerCommand('kaisendon_vscode.account_check', () => {
        //アクセストークン、インスタンス取れたか確認
        if (String(accessToken) !== 'undefined' && String(instance) !== 'undefined') {
            //読めた
            vscode.window.showInformationMessage('Setting OK');
        } else {
            //読めなかった
            vscode.window.showInformationMessage('Please Check');
        }
    });

    //TL表示
    const command = 'kaisendon_vscode.kaisendon';

    context.subscriptions.push(vscode.commands.registerCommand(command, () => {
        vscode.window.showInformationMessage('Mastodon Client');
        // Create and show panel
        const panel = vscode.window.createWebviewPanel(
            'kaisendon',
            'Kaisendon',
            vscode.ViewColumn.One,
            {
                //JS有効＆タブ移動してもWebView保持
                enableScripts: true,
                retainContextWhenHidden: true
            }
        );
        // And set its HTML content
        panel.webview.html = getWebviewContent(String(instance), String(accessToken), Boolean(setting_streaming_api), Boolean(setting_load_image), Boolean(setting_dark_mode));

    }));

    //トゥート
    context.subscriptions.push(vscode.commands.registerCommand('kaisendon_vscode.toot', () => {
        //TerminalからcurlでPOSTすればトゥートできるぞ！
        //テキストボックス
        var text = "";
        vscode.window.showInputBox({
        }).then((value) => {
            if (value !== undefined) {
                text = value;
                //新しいターミナル作成 PowerShell
                const terminal = vscode.window.createTerminal(`Status POST`, 'C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe');
                //ターミナルに文字を入れる
                terminal.sendText("$headers = @{ 'Authorization' = 'Bearer " + accessToken + "' }");
                terminal.sendText('$postText = @{"status"="' + text + '";"visibility"="public"} | ConvertTo-Json');
                terminal.sendText('$postBody = [Text.Encoding]::UTF8.GetBytes($postText)');
                terminal.sendText(' Invoke-RestMethod -Method POST -Uri "https://' + instance + '/api/v1/statuses" -Headers $headers  -Body $postBody -ContentType "application/json"');
            }
        });
    }));

    //StatusBer追加
    myStatusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
    myStatusBarItem.command = command;
    myStatusBarItem.text = '$(comment-discussion)   Kaisendon World !';
    myStatusBarItem.tooltip = 'Mastodon Client';
    myStatusBarItem.show();
    context.subscriptions.push(myStatusBarItem);

    context.subscriptions.push(disposable);

}


function getWebviewContent(instance: String, access_token: String, streming_mode: boolean, setting_load_image: boolean, setting_theme: Boolean) {
    return `<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <!--Import Google Icon Font　これ httpsにすると動く-->
    <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
    <!--Import materialize.css-->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/materialize/0.98.0/css/materialize.min.css">
    <title>Document</title>
</head>

<body id="body"
    onload="loadTL('https://`+ instance + `/api/v1/timelines/home?access_token=` + access_token + `','Home');">
    <!-- マテリアルデザインのやつ -->
    <!--Import jQuery before materialize.js-->
    <script type=" text/javascript" src="https://code.jquery.com/jquery-2.1.1.min.js">
    </script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/materialize/0.98.0/js/materialize.min.js"></script>

    <!-- ほーむとか -->
    <div>
        <a class="waves-effect waves-light btn" title="Home Timeline"
            onclick="loadType('https://`+ instance + `/api/v1/timelines/home?limit=40&access_token=` + access_token + `','Home');"><i
                class="material-icons">home</i></a>
        <a class="waves-effect waves-light btn" title="Notification"
            onclick="loadType('https://`+ instance + `/api/v1/notifications?limit=40&access_token=` + access_token + `','Notification');"><i
            class="material-icons">notifications</i></a>
        <a class="waves-effect waves-light btn" title="Local Timeline"
            onclick="loadType('https://`+ instance + `/api/v1/timelines/public?local=true&limit=40','Local Timeline');"><i
                class="material-icons">train</i></a>
        <a class="waves-effect waves-light btn" title="Federated Timeline"
            onclick="loadType('https://`+ instance + `/api/v1/timelines/public?limit=40','Federated Timeline');"><i
                class="material-icons">flight</i></a>
        <!-- 本題の画像読み込み、ストリーミングAPI -->
        <a class="waves-effect waves-light btn" title="ImageLoad Swich" id="image_load_button"
            onclick="imageLoadButton()"><i class="material-icons">photo</i></a>
        <a class="waves-effect waves-light btn" title="Streaming API" id="streaming_api_button"
            onclick="streaming_button();"><i class="material-icons">refresh</i></a>
        <a class="waves-effect waves-light btn" title="Theme Change" id="theme_button" onclick="theme_change();"><i
                class="material-icons">brightness_7</i></a>
    </div>

    <!-- タイムライン名　＋　アカウント -->
    <div>
        <font id="title_text" size="5">Home</font>
        <br>
        <font id="name_text" size="3">UserName</font>
    </div>

    <!-- Timeline -->
    <div id="timeline">

    </div>


</body>

<script>

    var add_load = false;   //追加読み込み制御
    var timeline_url = '';      //URL
    var timeline_title = '';
    var streaming_on = false;       //Streaming Swich
    var websoket = null;    //Websoket
    var image_load = true;  //アバター画像非表示
    var dark_theme = false;     //テーマ
    var theme_color = 'white';  //白か黒

    //設定適用
    //VSCode以外はこれからimageLoadButtonまで消してね
    if(`+ streming_mode + ` != null && ` + streming_mode + `){
        //起動したらすぐStreamingAPI利用
        streaming_on=true;
        document.getElementById("streaming_api_button").innerHTML = '<i class="material-icons ">sync</i></a>';
    }
    if(`+ setting_load_image + ` != null && ` + setting_load_image + `){
        //常に画像表示
        image_load = false;
    }else{
        image_load_button.innerHTML = '<i class="material-icons ">data_usage</i></a>';
    }
    if (`+ setting_theme + ` != null && ` + setting_theme + `){
        //起動したらすぐにダークモード
        theme_change()        
    }

    //画像読み込みボタン
    function imageLoadButton() {
        var image_load_button = document.getElementById('image_load_button');
        if (!image_load) {
            //有効
            image_load = true;
            image_load_button.innerHTML = '<i class="material-icons ">data_usage</i></a>';
        } else {
            //無効
            image_load = false;
            image_load_button.innerHTML = '<i class="material-icons ">photo</i></a>';

        }
    }

    //ストリーミング有効ボタン
    function streaming_button() {
        //有効に
        if (!streaming_on) {
            streaming_on = true;
            document.getElementById("streaming_api_button").innerHTML = '<i class="material-icons ">sync</i></a>';
        } else {
            streaming_on = false;
            document.getElementById("streaming_api_button").innerHTML = '<i class="material-icons">refresh</i></a>';
        }
    }

    //ストリーミングもしくは通常
    //titleはTLの名前
    function loadType(url, title) {
        //ストリーミングがあったら終了
        if (websoket != null) {
            websoket.close();
        }
        //タイトル
        var title_text = document.getElementById('title_text');
        title_text.innerText = title;
        timeline_title = title;
        //URL（追加読み込み用）
        timeline_url = url;
        if (streaming_on) {
            //すとりーみんぐ　って文字を出すよ！
            title_text.innerText = title_text.innerText + '  Streaming'
            //ストリーミング開始
            if (url.match('home')) {
                streamingAPITL('wss://` + instance + `/api/v1/streaming/?stream=user&access_token=` + access_token + `');
            }
            if (url.match('notification')) {
                streamingAPITL('wss://` + instance + `/api/v1/streaming/?stream=user:notification&access_token=` + access_token + `');
            }
            if (url.match('local=true')) {
                streamingAPITL('wss://` + instance + `/api/v1/streaming/?stream=public:local&access_token=` + access_token + `');
            }
            else if (url.match('public')) {
                streamingAPITL('wss://` + instance + `/api/v1/streaming/?stream=public&access_token=` + access_token + `');
            }
        } else {
            title_text.innerText = title_text.innerText.replace('Streaming', '');
            //ストリーミングしない
            if (!url.match('notifications')) {
            loadTL(url);
            } else {
             loadNotification(url);
            }
        }
    }

    //自分の名前とか
    getMyAccount('https://` + instance + `/api/v1/accounts/verify_credentials/?access_token=` + access_token + `');


     //TL読み込み
    function loadTL(url, title) {
        //空にする
        var timeline_div = document.getElementById('timeline');
        timeline_div.innerHTML = "";
        timeline_url = url;
        const request = new XMLHttpRequest();
        request.open("GET", url);
        request.addEventListener("load", (event) => {
            //200 Successful!
            if (event.target.status == 200) {
                //JSON Parse
                var responseText = event.target.responseText;
                var array = JSON.parse(responseText);
                for (var i = 0; i < array.length; i++) {
                    //statusを持ってくる
                    var object = array[i];
                    var bt = false;
                    //BTに対応させる
                    if (object.reblog != null) {
                        object = object.reblog;
                        bt = true;
                    }
                    //Status
                    var status = object.content;
                    //ID
                    var id = String(object.id);
                    //Display Name
                    var display_name = object.account.display_name;
                    //Acct
                    var acct = object.account.acct;
                    //名前
                    var name = display_name + '@' + acct;
                    //Avatar
                    var avatar = null;
                    if (!image_load) {
                        //画像表示モード
                        avatar = 'src=' + object.account.avatar;
                    } else {
                        //hidden　つけると非表示になるっぽい
                        avatar = 'hidden';
                    }

                    var browser = 'https://friends.nico/@' + acct + '/' + object.id;
                    //動的にHTML追加
                    if (!bt) {
                        //通常
                        timeline_div.innerHTML = timeline_div.innerHTML + '<div class="row"><div class="col s12 "><div class="card panel ' + theme_color + ' darken-4"><div class="card-content"><span class="card-title"><img ' + avatar + ' width="50" height="50" align="middle">' + name + '</span><p>' + status + '</p></div><div class="card-action"><a href="' + browser + '">Open brower</a></div></div></div ></div >';
                    } else {
                        //BTしたアカウント表示
                        object = array[i];
                        //Display Name
                        var display_name = object.account.display_name;
                        //Acct
                        var acct = object.account.acct;
                        //名前
                        var btname = display_name + '@' + acct;
                        timeline_div.innerHTML = timeline_div.innerHTML + '<div class="row"><div class="col s12 "><div class="card panel ' + theme_color + ' darken-4"><div class="card-content"><img ' + avatar + ' width="50" height="50" align="middle"><span class="card-title"><i class="material-icons">repeat</i>' + name + '<br> Boosted ' + btname + '</span><p>' + status + '</p></div><div class="card-action"><a href="' + browser + '">Open brower</a></div></div></div ></div >';
                    }
                }
            } else {
                alert("インスタンス名、アクセストークンを確認してみてね");
            }

        });
        request.send();
    }

    //アカウント情報取得
    function getMyAccount(url) {
        const request = new XMLHttpRequest();
        request.open("GET", url);
        request.addEventListener("load", (event) => {
            //200 Successful!
            if (event.target.status == 200) {
                //JSON Parse
                var responseText = event.target.responseText;
                var object = JSON.parse(responseText);
                //名前
                var display_name = object.display_name;
                //acct
                var acct = object.acct;
                var name = display_name + ' @' + acct;
                //HTML入れる
                var name_text = document.getElementById('name_text');
                name_text.innerText = name;
            } else {
                alert("インスタンス名、アクセストークンを確認してみてね");
            }

        });
        request.send();
    }

    //通知読み込み
    function loadNotification(url, title) {
        //空にする
        var timeline_div = document.getElementById('timeline');
        timeline_div.innerHTML = "";
        const request = new XMLHttpRequest();
        request.open("GET", url);
        request.addEventListener("load", (event) => {
            //200 Successful!
            if (event.target.status == 200) {
                //JSON Parse
                var responseText = event.target.responseText;
                var array = JSON.parse(responseText);
                for (var i = 0; i < array.length; i++) {
                    //statusを持ってくる
                    var object = array[i];
                    //通知先垢
                    var notification_name = object.account.display_name + ' @' + object.account.acct;
                    //Status
                    var status = object.status.content;
                    //名前
                    var name = notification_name;
                    //Avatar
                    var avatar = null;
                    if (!image_load) {
                        //画像表示モード
                        avatar = 'src=' + object.account.avatar;
                    } else {
                        //hidden　つけると非表示になるっぽい
                        avatar = 'hidden';
                    }
                    //タイプ
                    var type = '';
                    var icon = '';
                    switch (object.type) {
                        case "favourite":
                            type = 'お気に入り'
                            icon = "star_border";
                            break;
                        case "reblog":
                            type = 'ブースト'
                            icon = "replay";
                            break;
                        case "mention":
                            type = '返信'
                            icon = "announcement";
                            break;
                        case "follow":
                            type = 'フォロー'
                            icon = "add_person";
                            break;
                    }
                    var browser = 'https://friends.nico/web/statuses/' + object.status.id;
                    //動的にHTML追加
                    timeline_div.innerHTML = timeline_div.innerHTML + '<div class="row"><div class="col s12 "><div class="card panel ' + theme_color + ' darken-4"><span class="card-title"><img ' + avatar + ' width="50" height="50" align="middle"><i class="material-icons">' + icon + '</i >' + type + '<br>' + name + '</span><p>' + status + '</p><div class="card-action"><a href="' + browser + '">Open brower</a></div></div></div></div ></div >';
                }
            } else {
                alert("インスタンス名、アクセストークンを確認してみてね");
            }
        });
        request.send();
    }

    //Stereaming？
    function streamingAPITL(url) {
        //WebSocket
        websoket = new WebSocket(url);
        //空にする
        var timeline_div = document.getElementById('timeline');
        timeline_div.innerHTML = "";
        //接続した
        //通信が接続された場合
        websoket.onopen = function (e) {
            //接続中
            //alert(url);
        };

        //エラーが発生した場合
        websoket.onerror = function (error) {
            alert("エラーが発生しました。");
        };

        //メッセージを受け取った場合
        websoket.onmessage = function (e) {
            //console.log(e.data)
            //JSON Parse
            object = JSON.parse(e.data);
            payload = JSON.parse(object.payload);
            if (object.event == 'update' && url.indexOf('notification')) {
                //ホームとローカルと連合
                var bt = false;
                //BTに対応させる
                if (payload.reblog != null) {
                    payload = payload.reblog;
                    bt = true;
                }//Content
                var status = payload.content;
                //ID
                var id = payload.id;
                //Display Name
                var display_name = payload.account.display_name;
                //Acct
                var acct = payload.account.acct;
                //名前
                var name = display_name + '@' + acct;
                //Avatar
                var avatar = null;
                if (!image_load) {
                    //画像表示モード
                    avatar = 'src=' + payload.account.avatar;
                } else {
                    //hidden　つけると非表示になるっぽい
                    avatar = 'hidden';
                }
                var browser = 'https://friends.nico/@' + acct + '/' + id;

                //動的にHTML追加
                if (!bt) {
                    //通常
                    timeline_div.innerHTML = '<div class="row"><div class="col s12 "><div class="card panel ' + theme_color + ' darken-4"><div class="card-content"><span class="card-title"><img ' + avatar + ' width="50" height="50" align="middle">' + name + '</span><p>' + status + '</p></div><div class="card-action"><a href="' + browser + '">Open brower</a></div></div></div ></div >' + timeline_div.innerHTML;
                } else {
                    //BTしたアカウント表示
                    payload = JSON.parse(object.payload);
                    //Display Name
                    var display_name = payload.account.display_name;
                    //Acct
                    var acct = payload.account.acct;
                    //名前
                    var btname = display_name + '@' + acct;
                    timeline_div.innerHTML = '<div class="row"><div class="col s12 "><div class="card panel ' + theme_color + ' darken-4"><div class="card-content"><img ' + avatar + ' width="50" height="50" align="middle"><span class="card-title"><i class="material-icons">repeat</i>' + name + '<br> Boosted ' + btname + '</span><p>' + status + '</p></div><div class="card-action"><a href="' + browser + '">Open brower</a></div></div></div ></div >' + timeline_div.innerHTML;
                }
                //max_id
                //追加読み込み
                if (add_load == false) {
                    var max_id = payload.id;
                    loadTL(timeline_url + '&max_id=' + max_id, timeline_title);
                    add_load = true;
                }
            } else if (object.event == 'notification') {
                //通知
                var id = payload.id;
                //通知先垢
                var notification_name = payload.account.display_name + ' @' + payload.account.acct;
                //Status
                var status = payload.status.content;
                //名前
                var name = notification_name;
                //Avatar
                var avatar = null;
                if (!image_load) {
                    //画像表示モード
                    avatar = 'src=' + payload.account.avatar;
                } else {
                    //hidden　つけると非表示になるっぽい
                    avatar = 'hidden';
                }
                //タイプ
                var type = '';
                var icon = '';
                switch (payload.type) {
                    case "favourite":
                        type = 'お気に入り'
                        icon = "star_border";
                        break;
                    case "reblog":
                        type = 'ブースト'
                        icon = "replay";
                        break;
                    case "mention":
                        type = '返信'
                        icon = "announcement";
                        break;
                    case "follow":
                        type = 'フォロー'
                        icon = "add_person";
                        break;
                }
                var browser = 'https://friends.nico/@' + payload.account.username + '/' + object.id;
                //動的にHTML追加
                timeline_div.innerHTML = '<div class="row"><div class="col s12 "><div class="card panel ' + theme_color + ' darken-4"><span class="card-title"><img ' + avatar + ' width="50" height="50" align="middle"><i class="material-icons">' + icon + '</i >' + type + '<br>' + name + '</span><p>' + status + '</p><div class="card-action"><a href="' + browser + '">Open brower</a></div></div></div></div ></div >' + timeline_div.innerHTML;
                //max_id
                //追加読み込み
                if (add_load == false) {
                    var max_id = payload.id;
                    loadNotification(timeline_url + '&max_id=' + max_id, timeline_title);
                    add_load = true;
                }
            }
        }
        //通信が切断された場合
        websoket.onclose = function () {
            alert("通信が切断されました。");
            //追加読み込み再度有効
            add_load = false;
        };
    };


    //CSS切り替え？
    function theme_change() {
        var body = document.getElementById('body');
        if (!dark_theme) {
            dark_theme = true;
            //ダークモードへ
            var theme_button = document.getElementById('theme_button');
            theme_button.innerHTML = '<i class="material-icons ">brightness_2</i></a>';
            //黒基調
            body.style.color = '#ffffff';
            body.style.backgroundColor = '#000000';
            theme_color = 'grey';
            //どうやってもCardの中だけは色が変わらんので該当のところを変更
            //JSにreplaceAll無いのかよ仕方ないからなくなるまでWhileで回す
            while (body.innerHTML.match('<div class="card panel white darken-4">')) {
                body.innerHTML = body.innerHTML.replace('<div class="card panel white darken-4">', '<div class="card panel grey darken-4">');
            }
        } else {
            dark_theme = false;
            //ダークモードへ
            var theme_button = document.getElementById('theme_button');
            theme_button.innerHTML = '<i class="material-icons ">brightness_5</i></a>';
            //黒基調
            body.style.color = '#000000';
            body.style.backgroundColor = '#ffffff';
            theme_color = 'white';
            //どうやってもCardの中だけは色が変わらんので該当のところを変更
            //JSにreplaceAll無いのかよ仕方ないからなくなるまでWhileで回す
            while (body.innerHTML.match('<div class="card panel grey darken-4">')) {
                body.innerHTML = body.innerHTML.replace('<div class="card panel grey darken-4">', '<div class="card panel white darken-4">');
            }
        }
    }

 
</script>

</html>`;
}

// this method is called when your extension is deactivated
export function deactivate() { }
