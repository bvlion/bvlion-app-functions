# 機能

## /test

body をそのまま返す

## /hello

メンションかつ特定チャンネルの場合にデプロイ対象のアプリ名ボタンを表示する  
https://api.slack.com/apps

## /deploy

* /hello で表示されたボタンが押下されたらタグバージョンを表示のうえデプロイボタンを表示する
* デプロイボタンが押下されたら GitHub にタグを打って CircleCI の API を叩く

タグは基本的にマイナーバージョンが自動で上がり、必要に応じて DB を更新してアップデートする。

## /pull\_request

GitHub からの Webhook に反応して CircleCI の API を叩く

# RTDB 構成

```
{
  "function" : {
    "GitHub" : {
      "branch-name" : {
        "branch" : "master",
        "name" : "BranchName",
        "version" : "1.0.0"
      },
      "secret" : "secret"
    },
    "actions" : [ "branch-name" ],
    "message" : {
      "cancel" : "Deploy is canceled.",
      "channel" : "Can use #channel only.",
      "deploy" : "Deploy ??",
      "error" : "keyword not seted."
    },
    "target_channel" : "xxxxxxxxx",
    "team" : "xxxxxxxxx",
    "token" : {
      "circleci" : "circle_ci_secret",
      "github" : "github_secret",
      "slack" : "xoxb-slack_secret"
    },
    "user" : "user"
  }
}
```

# コメント

* Cloud Functions For Firebase から外部へ接続するには有料プランにする必要があります。
* GitHub のプルリクへの反応と、Slack からのデプロイができないかと思い作りました。
* Circle CI と連携しており、2.1 行こうの orbs を利用するとパラメータを受け取れてよいかと感じております。
