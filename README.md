# PinPonApp


crear servicio de node js en windows
https://stackoverflow.com/questions/42758985/windows-auto-start-pm2-and-node-apps



generar apk
ionic build --prod  // compila el codigo a un formato js

npx cap add android // crea el proyecto para exportarlo android estudio basado en la build de ionic

npx cap open android // abre el android estudio con el proyecto

npx cap sync



npx ionic cap synx
npx cap open android



build.gradle minSdkVersion 26
<meta-data 
android:name="com.google.mlkit.vision.DEPENDENCIES" 
android:value="barcode_ui"/>


<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
<!-- Para Android 13+ (API 33+), usa también este permiso -->
<uses-permission android:name="android.permission.READ_MEDIA_IMAGES" />