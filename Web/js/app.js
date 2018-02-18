$(document).ready(function() {
    $("#Captcha").emotionCaptcha({
        languageCode: "de",
        //orientation: "bellow",
        verified: function()
        {
            alert("You are a human");
        }
    });
});