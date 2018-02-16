$(document).ready(function() {
    $("#Captcha").mycaptcha({
        apiKey: "abc",
        //orientation: "bellow",
        verified: function()
        {
            alert("You are a human");
        }
    });
});