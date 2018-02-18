$(document).ready(function() {
    $("#Captcha").emotionCaptcha({
        apiKey: "abc",
        //orientation: "bellow",
        verified: function()
        {
            alert("You are a human");
        }
    });
});