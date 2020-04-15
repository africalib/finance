package com.example.sample.plugin;

import android.app.Activity;
import android.app.ProgressDialog;
import android.graphics.Color;
import android.os.Bundle;
import android.view.View;

import com.google.android.gms.ads.AdRequest;
import com.google.android.gms.ads.MobileAds;
import com.google.android.gms.ads.reward.RewardItem;
import com.google.android.gms.ads.reward.RewardedVideoAd;
import com.google.android.gms.ads.reward.RewardedVideoAdListener;

import org.africalib.finance.R;

public class NewActivity extends Activity {
    private RewardedVideoAd _rewardedVideoAd;
    private ProgressDialog _progressDialog;
    private boolean _rewarded;
    private boolean _enableBack;
    private View _view;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        _progressDialog = new ProgressDialog(this);
        _progressDialog.setIndeterminate(true);
        _progressDialog.setMessage("광고 영상을 로드하고 있습니다.");
        _progressDialog.setCancelable(false);
        _progressDialog.show();

        _rewarded = false;
        _enableBack = false;

        _view = this.getWindow().getDecorView();
        _view.setBackgroundColor(Color.WHITE);

        MobileAds.initialize(this, getResources().getString(R.string.banner_ad_unit_id_for_test));

        _rewardedVideoAd = MobileAds.getRewardedVideoAdInstance(this);
        _rewardedVideoAd.setRewardedVideoAdListener(new RewardedVideoAdListener() {
            @Override
            public void onRewarded(RewardItem reward) {
                //Toast.makeText(getApplicationContext(), "onRewarded! currency: " + reward.getType() + "  amount: " + reward.getAmount(), Toast.LENGTH_SHORT).show();

                // 사용자에게 보상할 내용
                _rewarded = true;
            }

            @Override
            public void onRewardedVideoAdLeftApplication() {
                _enableBack = true;
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
                _enableBack = true;
                //Toast.makeText(getApplicationContext(), "VideoAdFailedToLoad", Toast.LENGTH_SHORT).show();
            }

            @Override
            public void onRewardedVideoCompleted() {
                _enableBack = true;
                //Toast.makeText(getApplicationContext(), "VideoCompleted", Toast.LENGTH_SHORT).show();
            }

            @Override
            public void onRewardedVideoAdLoaded() {
                _enableBack = true;
                _progressDialog.hide();
                _rewardedVideoAd.show();
                //Toast.makeText(getApplicationContext(), "VideoAdLoaded", Toast.LENGTH_SHORT).show();
            }

            @Override
            public void onRewardedVideoAdOpened() {
                _enableBack = true;
                //Toast.makeText(getApplicationContext(), "VideoAdOpened", Toast.LENGTH_SHORT).show();
            }

            @Override
            public void onRewardedVideoStarted() {
                _enableBack = true;
                //Toast.makeText(getApplicationContext(), "VideoStarted", Toast.LENGTH_SHORT).show();
            }
        });

        _rewardedVideoAd.loadAd(getResources().getString(R.string.banner_ad_unit_id_for_test), new AdRequest.Builder().build());
    }

    @Override
    public void onBackPressed() {
        if (_enableBack)
            super.onBackPressed();
    }
}