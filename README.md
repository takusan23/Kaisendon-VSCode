# kaisendon-vscode README

You can display the Mastodon timeline.
<img src="https://raw.githubusercontent.com/takusan23/Kaisendon-VSCode/master/img/read_me_image.gif">

# Download
<a href="https://marketplace.visualstudio.com/items?itemName=takusan23.kaisendon-vscode">
Download (Marketplace)
</a>

# How to use
Please set the instance and access token in settings.
You can issue access tokens by going to Settings => Development and creating a new app.

```setting.json
"kaisendon_vscode.Access Token": "Access_Token",
"kaisendon_vscode.Instance": "Instance Name"
```
Then enter the following command:  
`>account_check`  
（Japanese:`>インスタンスとアクセストークンの確認`）  
The setting is complete when "Setting OK" is output.

# Show timeline

`>Kaisendon Start`  
(Japanese : `>かいせんどんを起動`)

# Toot !!!!
`>Toot !`  
(にほんご : `>トゥート！`)
<img src="https://raw.githubusercontent.com/takusan23/Kaisendon-VSCode/master/img/read_me_image.gif">   

## operation
<img src="https://raw.githubusercontent.com/google/material-design-icons/master/action/1x_web/ic_home_black_48dp.png" align="middle">
Home Timeline
<br>
<img src="https://raw.githubusercontent.com/google/material-design-icons/master/social/1x_web/ic_notifications_black_48dp.png" align="middle">
Notificaiton
<br>
<img src="https://raw.githubusercontent.com/google/material-design-icons/master/maps/1x_web/ic_train_black_48dp.png" align="middle">
Local Timeline
<br>
<img src="https://raw.githubusercontent.com/google/material-design-icons/master/maps/1x_web/ic_flight_black_48dp.png" align="middle">
Federated Timeline
<br>
<img src="https://raw.githubusercontent.com/google/material-design-icons/master/image/1x_web/ic_photo_black_48dp.png" align="middle">
<img src="https://raw.githubusercontent.com/google/material-design-icons/master/device/1x_web/ic_data_usage_black_48dp.png" align="middle">
Image display / hide button
<br>
<img src="https://raw.githubusercontent.com/google/material-design-icons/master/navigation/1x_web/ic_refresh_black_48dp.png" align="middle">
<img src="https://raw.githubusercontent.com/google/material-design-icons/master/notification/1x_web/ic_sync_black_48dp.png" align="middle">
Streaming API enabled / disabled
<br>
<img src="https://raw.githubusercontent.com/google/material-design-icons/master/image/ios/ic_brightness_7.imageset/ic_brightness_7_2x.png" align="middle">
<img src="https://raw.githubusercontent.com/google/material-design-icons/master/image/ios/ic_brightness_2.imageset/ic_brightness_2_2x.png" align="middle">
Dark mode enabled / disabled


## What you can do
You can display the timeline.  
Supports streaming API.  
  
## Things impossible
~~Toot,~~ favorite, boost  
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

### 🤔
<img src="https://raw.githubusercontent.com/takusan23/Kaisendon-VSCode/master/img/thinking_tl.png">
