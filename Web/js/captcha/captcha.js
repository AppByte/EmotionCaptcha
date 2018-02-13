jQuery.fn.extend({
   mycaptcha: function(configuration)
   {
        var targetElement = $(this);
        var token = null;
        var captchaButton = null;

        $.post("http://localhost:3000/requestToken", {
            apiToken: sha256(configuration.apiKey)
        }).done(function(result) {
            token = result.token;
            targetElement.append(createCaptchaButton(token));

            $('[data-id="'+ result.token +'"]').click(function() {
                displayCaptcha($(this));
            })
        });
   }
});

function createCaptchaButton(token)
{
    return "<button class=\'btn btn-outline-success\' data-id='"+token+"'>Verify</button>";
}

function displayCaptcha(button)
{
    console.log(button);
}