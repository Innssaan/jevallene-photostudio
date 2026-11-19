package id.my.innssaan.jevallene;

import android.Manifest;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.os.Bundle;
import android.view.View;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;
import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsCompat;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
  private static final int CAMERA_PERMISSION_REQUEST = 1001;
  private static final String APP_BASE_URL = "https://jevallene-photostudio.vercel.app/?app=android";

  @Override
  protected void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);

    // Ensure WebView never draws behind the phone's status bar or system gesture bar
    WindowCompat.setDecorFitsSystemWindows(getWindow(), true);
    View root = findViewById(android.R.id.content);
    if (root != null) {
      ViewCompat.setOnApplyWindowInsetsListener(root, (v, insets) -> {
        Insets systemBars = insets.getInsets(WindowInsetsCompat.Type.systemBars());
        v.setPadding(systemBars.left, systemBars.top, systemBars.right, systemBars.bottom);
        return WindowInsetsCompat.CONSUMED;
      });
    }

    if (ContextCompat.checkSelfPermission(this, Manifest.permission.CAMERA)
        != PackageManager.PERMISSION_GRANTED) {
      ActivityCompat.requestPermissions(
          this,
          new String[] { Manifest.permission.CAMERA },
          CAMERA_PERMISSION_REQUEST
      );
    }

    handleAuthDeepLink(getIntent());
  }

  @Override
  protected void onNewIntent(Intent intent) {
    super.onNewIntent(intent);
    setIntent(intent);
    handleAuthDeepLink(intent);
  }

  private void handleAuthDeepLink(Intent intent) {
    if (intent == null) return;
    Uri data = intent.getData();
    if (data == null) return;
    if (!"jevallene".equals(data.getScheme()) || !"auth-callback".equals(data.getHost())) {
      return;
    }

    StringBuilder target = new StringBuilder(APP_BASE_URL);
    String query = data.getEncodedQuery();
    if (query != null && !query.isEmpty()) {
      target.append("&").append(query);
    }
    String fragment = data.getEncodedFragment();
    if (fragment != null && !fragment.isEmpty()) {
      target.append("#").append(fragment);
    }

    final String targetUrl = target.toString();
    if (getBridge() != null && getBridge().getWebView() != null) {
      getBridge().getWebView().post(() -> getBridge().getWebView().loadUrl(targetUrl));
    }
  }
}
