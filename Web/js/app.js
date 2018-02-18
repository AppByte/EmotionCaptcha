$(document).ready(function() {
    $("#Captcha").emotionCaptcha({
        apiKey: "abc",
        languageCode: "de",
        //orientation: "bellow",
        verified: function()
        {
            alert("You are a human");
        }
    });
});