# kaisendon-vscode README

You can display the Mastodon timeline.
<img src="https://raw.githubusercontent.com/takusan23/Kaisendon-VSCode/master/read_me_image.gif">

# How to use
Please set the instance and access token in settings.
You can issue access tokens by going to Settings => Development and creating a new app.

```setting.json
"kaisendon_vscode.Access Token": "Access_Token",
"kaisendon_vscode.Instance": "Instance Name",
```

## What you can do
You can display the timeline.  
Supports streaming API.  
  
## Things impossible
Toot, favorite, boost  
(It was impossible because 422 returned)

## Configuration
`kaisendon_vscode.Streaming` 

Enable the streaming API immediately after launching.

`kaisendon_vscode.Load Image`

Always show the image.
For those who do not want to use mobile data very much.

`kaisendon_vscode.Dark Mode`

Always enable dark mode.
It is a dark mode that has become popular recently.
