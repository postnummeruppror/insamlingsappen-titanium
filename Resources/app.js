var tabGroup = Ti.UI.createTabGroup();
var win = Ti.UI.createWindow({
    title: "postnummeruppror.nu",
    backgroundColor: "#fff",
    layout: "vertical"
});
var info = Ti.UI.createWindow({
    title: "Information",
    backgroundColor: "#fff",
    layout: "vertical"
});
var tab = Ti.UI.createTab({
    icon: 'geo_fence.png',
    title: 'Insamling',
    window: win
});
var tabinfo = Ti.UI.createTab({
    icon: 'info.png',
    title: 'Info',
    window: info
});
tabGroup.addTab(tab);
tabGroup.addTab(tabinfo);
if (Ti.App.Properties.getString("UUID", null) == null) {
    Ti.App.Properties.setString("UUID", createRandomUUID());
}
var data = {};
var flexSpace = Ti.UI.createButton({
    systemButton: Ti.UI.iPhone.SystemButton.FLEXIBLE_SPACE
});
var done = Ti.UI.createButton({
    title: 'Klar',
    style: Ti.UI.iPhone.SystemButtonStyle.DONE,
});
var cancel = Ti.UI.createButton({
    title: 'Avbryt',
    style: Ti.UI.iPhone.SystemButtonStyle.CANCEL,
});
cancel.addEventListener("click", function (e) {
    fld.blur();
})
done.addEventListener("click", function (e) {
    fld.blur();
})
var toolbar = Ti.UI.iOS.createToolbar({
    items: [cancel, flexSpace, done],
    bottom: 0,
    borderTop: false,
    borderBottom: false
});
var fld = Ti.UI.createTextField({
    top: "20dp",
    borderStyle: Ti.UI.INPUT_BORDERSTYLE_ROUNDED,
    hintText: "Postnummer...",
    width: "50%",
    keyboardType: Ti.UI.KEYBOARD_NUMBER_PAD,
    maxLength: 5,
    keyboardToolbar: toolbar
});
Ti.Geolocation.setPurpose("Ge oss din position!");
Ti.Geolocation.getCurrentPosition(function(e) {
    data = {
        "accountIdentity": Ti.App.Properties.getString("UUID"),
        "application": "insamlingsappen-titanium",
        "applicationVersion": "0.0.1",
        "provider": "gps",
        "latitude": e.coords.latitude,
        "longitude": e.coords.longitude,
        "accuracy": e.coords.accuracy,
        "altitude": e.coords.altitude,
        "postalCode": "",
        "streetName": null,
        "houseNumber": null,
        "postalTown": null
    };
    draw();
});

function draw() {
    var lblData = Ti.UI.createLabel({
        top: "10%",
        text: "UUID: " + data.accountIdentity + "\n" + "Lat: " + data.latitude + "\n" + "Lng: " + data.longitude + "\n" + "Acc: " + data.accuracy + "\n" + "Alt: " + data.altitude + "\n",
        font: {
            fontSize: 10
        }
    });
    fld.addEventListener("change", function(e) {
        if (e.value.length == 5) {
            e.source.blur();
            data.postalCode = e.value;
            btn.show();
        } else {
            btn.hide();
        }
    });
    var lbl = Ti.UI.createLabel({
        text: "Postnummer"
    });
    var btn = Ti.UI.createButton({
        top: "20dp",
        title: "Skicka",
        visible: false,
        backgroundColor: "#c0c0c0",
        padding: 10,
        width: "30%"
    });
    btn.addEventListener("click", send);
    win.add(lblData, fld, btn);
    tabGroup.open();
}

function send() {
    var url = 'http://insamling.postnummeruppror.nu/api/location_sample/create';
    var client = Ti.Network.createHTTPClient({
        onload: function(e) {
            fld.value = "";
            Ti.API.info("Onload: " + JSON.stringify(e));
        },
        onerror: function(e) {
            Ti.API.info("Error: " + JSON.stringify(e));
        },
        timeout: 5000
    });
    client.open("POST", url);
    client.send(JSON.stringify(data));
}

function createRandomUUID() {
    var s = [];
    var hexDigits = "0123456789abcdef";
    for (var i = 0; i < 36; i++) {
        s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
    }
    s[14] = "4"; // bits 12-15 of the time_hi_and_version field to 0010
    s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1); // bits 6-7 of the clock_seq_hi_and_reserved to 01
    s[8] = s[13] = s[18] = s[23] = "-";
    return s.join("");
};