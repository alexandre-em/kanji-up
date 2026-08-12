# Add project specific ProGuard rules here.
# By default, the flags in this file are appended to flags specified
# in /usr/local/Cellar/android-sdk/24.3.3/tools/proguard/proguard-android.txt
# You can edit the include path and order by changing the proguardFiles
# directive in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# Add any project specific keep options here:
-keep class com.facebook.react.** { *; }
-keep class com.facebook.hermes.** { *; }
-keepclassmembers class * {
    @com.facebook.react.uimanager.annotations.ReactProp <methods>;
}
-dontwarn com.facebook.react.**
-keep class com.qivia.BuildConfig { *; }

-keep class com.android.installreferrer.api.** {
  *;
}

# @kanjiup/recognition's TFLite-backed native module: classes are loaded via JNI/reflection, so
# R8 stripping them in release builds crashes the app at native module registration (app
# startup), before any JS screen renders — no consumer proguard rules ship with the library.
-keep class org.tensorflow.** { *; }
-dontwarn org.tensorflow.**
-keep class com.kanjiuprecognition.** { *; }
-keep class com.recognizer.** { *; }
