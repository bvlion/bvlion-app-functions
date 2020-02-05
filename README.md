# 機能

## /test

body をそのまま返す

## /hello

メンションかつ特定チャンネルの場合にデプロイ対象のアプリ名ボタンを表示する

## /deploy

* /hello で表示されたボタンが押下されたらタグバージョンを表示のうえデプロイボタンを表示する
* デプロイボタンが押下されたら GitHub にタグを打って CircleCI の API を叩く

タグは基本的にマイナーバージョンが自動で上がり、必要に応じて DB を更新してアップデートする。

## /pull\_request

GitHub からの Webhook に反応して CircleCI の API を叩く

## /version

/version/{app\_name} で対象アプリのバージョンを返す

# RTDB 構成

後で書く
