package com.example.sample.plugin;

import android.app.Activity;
import android.app.ProgressDialog;
import android.graphics.Color;
import android.os.Bundle;
import android.view.View;
import android.view.Window;
import android.widget.Toast;

import com.google.android.gms.ads.AdRequest;
import com.google.android.gms.ads.MobileAds;
import com.google.android.gms.ads.reward.RewardItem;
import com.google.android.gms.ads.reward.RewardedVideoAd;
import com.google.android.gms.ads.reward.RewardedVideoAdListener;

import org.africalib.finance.BuildConfig;
import org.africalib.finance.R;

public class NewActivity extends Activity {
    private RewardedVideoAd _rewardedVideoAd;
    private ProgressDialog _progressDialog;
    private boolean _rewarded;
    private boolean _loaded;
    private View _view;
    private String _adUnitId;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        this.requestWindowFeature(Window.FEATURE_NO_TITLE);

        _progressDialog = new ProgressDialog(this);
        _progressDialog.setIndeterminate(true);
        _progressDialog.setMessage("���� ������ �ε��ϰ� �ֽ��ϴ�.");
        _progressDialog.setCancelable(false);
        _progressDialog.show();

        _rewarded = false;
        _loaded = false;

        _view = this.getWindow().getDecorView();
        _view.setBackgroundColor(Color.WHITE);

        new android.os.Handler().postDelayed(
                () -> {
                    if (!_loaded)
                        fin();
                }, 5000);

        if (BuildConfig.DEBUG)
            _adUnitId = getResources().getString(R.string.banner_ad_unit_id_for_test);
        else
            _adUnitId = getResources().getString(R.string.banner_ad_unit_id);

        MobileAds.initialize(this, getResources().getString(R.string.admob_app_id));

        _rewardedVideoAd = MobileAds.getRewardedVideoAdInstance(this);
        _rewardedVideoAd.setRewardedVideoAdListener(new RewardedVideoAdListener() {
            @Override
            public void onRewarded(RewardItem reward) {
                //Toast.makeText(getApplicationContext(), "onRewarded! currency: " + reward.getType() + "  amount: " + reward.getAmount(), Toast.LENGTH_SHORT).show();

                // ����ڿ��� ������ ����
                _rewarded = true;
            }

            @Override
            public void onRewardedVideoAdLeftApplication() {
                //Toast.makeText(getApplicationContext(), "VideoAdLeftApplication", Toast.LENGTH_SHORT).show();
            }

            @Override
            public void onRewardedVideoAdClosed() {
                if (_rewarded) {
                    finish();
                } else {
                    finishAffinity();
                }
                //Toast.makeText(getApplicationContext(), "VideoAdClosed", Toast.LENGTH_SHORT).show();
            }

            @Override
            public void onRewardedVideoAdFailedToLoad(int errorCode) {
                fin();
                //Toast.makeText(getApplicationContext(), "VideoAdFailedToLoad", Toast.LENGTH_SHORT).show();
            }

            @Override
            public void onRewardedVideoCompleted() {
                //Toast.makeText(getApplicationContext(), "VideoCompleted", Toast.LENGTH_SHORT).show();
            }

            @Override
            public void onRewardedVideoAdLoaded() {
                _loaded = true;
                _progressDialog.hide();
                _rewardedVideoAd.show();
                //Toast.makeText(getApplicationContext(), "VideoAdLoaded", Toast.LENGTH_SHORT).show();
            }

            @Override
            public void onRewardedVideoAdOpened() {
                //Toast.makeText(getApplicationContext(), "VideoAdOpened", Toast.LENGTH_SHORT).show();
            }

            @Override
            public void onRewardedVideoStarted() {
                //Toast.makeText(getApplicationContext(), "VideoStarted", Toast.LENGTH_SHORT).show();
            }
        });

        _rewardedVideoAd.loadAd(_adUnitId, new AdRequest.Builder().build());
    }

    public void fin() {
        Toast.makeText(getApplicationContext(), "���� ������ �����ϴ�.", Toast.LENGTH_LONG).show();
        finish();
    }

    @Override
    public void onBackPressed() {
        if (_loaded)
            super.onBackPressed();
    }
}