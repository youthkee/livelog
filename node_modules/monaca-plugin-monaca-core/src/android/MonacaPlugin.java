package mobi.monaca.plugin;

import java.io.IOException;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.UUID;

import org.apache.cordova.CallbackContext;
import org.apache.cordova.CordovaArgs;
import org.apache.cordova.CordovaPlugin;
import org.json.JSONException;
import org.json.JSONObject;
import org.xmlpull.v1.XmlPullParser;
import org.xmlpull.v1.XmlPullParserException;

import android.annotation.SuppressLint;
import android.content.Context;
import android.content.SharedPreferences;
import android.content.res.Resources;
import android.content.res.XmlResourceParser;
import android.provider.Settings.Secure;
import android.util.AttributeSet;
import android.util.Xml;
import android.webkit.CookieManager;

public class MonacaPlugin extends CordovaPlugin {
    private static final String MONACA_CONFIG_PREFIX = "monaca:";
    private static final String TAG_PREFERENCE = "preference";
    private static final String DEVICE_ID_HASH_ALGORITH = "SHA-1";
    private static final String PREFERENCES_NAME = "MonacaNativePlugin";
    private boolean mParsed = false;
    private String mBackendId;
    private String mBackendApiKey;
    private String mBackendUrl;
    private boolean mDisableCookie = true;

    @Override
    public boolean execute(String action, CordovaArgs args, CallbackContext callbackContext) throws JSONException {
        if (action.equals("getRuntimeConfiguration")) {
            JSONObject json = buildResultJson();
            if (json.length() == 0) {
                callbackContext.error("cannot get any values.");
            } else {
                callbackContext.success(json);
            }
            return true;
        }
        return super.execute(action, args, callbackContext);
    }

    private JSONObject buildResultJson() {
        JSONObject result = new JSONObject();

        parseConfigXml(false);
        add(result, "deviceId", getDeviceId(cordova.getActivity()));
        add(result, "backendId", mBackendId);
        add(result, "apiKey", mBackendApiKey);
        add(result, "url", mBackendUrl);
        if (isMonacaDebugger()) {
            add(result, "isMonacaDebugger", "1");
        }

        return result;
    }

    private boolean isMonacaDebugger() {
        Class clazz;
        try {
            clazz = Class.forName("mobi.monaca.plugins.debugger.MonacaDebuggerPlugin");
        } catch (ClassNotFoundException e) {
            return false;
        }
        return true;
    }

    private void add(JSONObject json, String key, String value) {
        try {
            json.putOpt(key, value);
        } catch (JSONException e) {
            e.printStackTrace();
        }
    }

    /**
     * Parse config.xml
     *
     * This method would be called by Debugger, too.
     * Don't change method signiture.
     *
     * @param force true=force parse, false=not parse if parsed
     */
    @SuppressLint("NewApi")
    public void parseConfigXml(boolean force) {
        if (!force && mParsed) {
            return;
        }

        mParsed = true;
        mBackendId = null;
        mBackendApiKey = null;
        mBackendUrl = null;
        mDisableCookie = true;
        XmlPullParser xml = getConfigXml();

        if (xml != null) {
            int eventType = -1;

            while (eventType != XmlResourceParser.END_DOCUMENT) {
                if (eventType == XmlResourceParser.START_TAG) {
                    String strNode = xml.getName();
                    AttributeSet attributes = Xml.asAttributeSet(xml);

                    if (strNode.equals(TAG_PREFERENCE)) {
                        String name = attributes.getAttributeValue(null, "name");
                        String value = attributes.getAttributeValue(null, "value");

                        if (name.startsWith(MONACA_CONFIG_PREFIX)) {
                            name = name.replaceFirst(MONACA_CONFIG_PREFIX, "");
                            if (name.equals("MonacaBackendId")) {
                                mBackendId = value;
                            } else if (name.equals("MonacaBackendApiKey")) {
                                mBackendApiKey = value;
                            } else if (name.equals("MonacaBackendUrl")) {
                                mBackendUrl = value;
                            } /* else if (name.equals("DisableCookie")) {
                            	mDisableCookie = Boolean.valueOf(value);
                            } */
                        }
                    }
                }
                try {
                    eventType = xml.next();
                } catch (XmlPullParserException e) {
                    e.printStackTrace();
                } catch (IOException e) {
                    e.printStackTrace();
                }
            }
        }

        // CookieManager cookieManager = CookieManager.getInstance();
        // cookieManager.setAcceptCookie(!mDisableCookie);
    }

    protected XmlPullParser getConfigXml() {
        Resources res = cordova.getActivity().getResources();
        int id = res.getIdentifier("config", "xml", cordova.getActivity().getClass().getPackage().getName());

        if (id == 0) {
            id = res.getIdentifier("config", "xml", cordova.getActivity().getPackageName());

            if (id == 0) {
                return null;
            }
        }

        return res.getXml(id);
    }

    public static String getDeviceId(Context context) {
        String id = Secure.getString(context.getContentResolver(), Secure.ANDROID_ID);
        if (id == null) {
            id = getIDUsingUUID(context);
        }
        try {
            return toHashedString(id, DEVICE_ID_HASH_ALGORITH);
        } catch (NoSuchAlgorithmException e) {
            e.printStackTrace();
            return null;
        }
    }

    public static String getIDUsingUUID(Context context) {
        SharedPreferences preferences = context.getSharedPreferences(PREFERENCES_NAME, Context.MODE_PRIVATE);
        String uuid = preferences.getString("uuid", null);
        if (uuid == null) {
            uuid = UUID.randomUUID().toString();
            preferences.edit().putString("uuid", uuid).commit();
        }
        return uuid;
    }

    private static String toHashedString(String source, String algorithm) throws NoSuchAlgorithmException {
        MessageDigest md = MessageDigest.getInstance(algorithm);
        byte[] digest = md.digest(source.getBytes());

        StringBuilder sb = new StringBuilder();
        for (byte b : digest) {
            String hex = String.format("%02x", b);
            sb.append(hex);
        }
        return sb.toString();
    }
}
