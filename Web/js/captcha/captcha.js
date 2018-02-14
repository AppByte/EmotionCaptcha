jQuery.fn.extend({
   mycaptcha: function(configuration)
   {
        var targetElement = $(this);
        var captchaID = null;
        var captchaContainerID = null;
        var captchaButton = null;

        $.post("http://localhost:3000/requestToken", {
            apiToken: sha256(configuration.apiKey)
        }).done(function(result)
        {
            captchaID = result.token.substring(Math.floor(Math.random() * result.token.length), Math.floor(Math.random() * result.token.length));
            captchaContainerID = result.token.substring(Math.floor(Math.random() * result.token.length), Math.floor(Math.random() * result.token.length));
            targetElement.append(createCaptchaButton(captchaID));
            targetElement.append(createCaptchaContainer(captchaContainerID));
            captchaButton = $('#'+ captchaID);
            captchaButton.click(function() {
                displayCaptchaContainer(captchaContainerID);
            })
        });
   }
});

function createCaptchaButton(identifier)
{
    return "<button class=\'btn btn-outline-success\' id='"+identifier+"'>Verify</button>";
}

function createCaptchaContainer(identifier)
{
    return "<div class='captcha-container hidden'id='" + identifier + "'></div>"
}

function displayCaptchaContainer(identifier)
{
    var captchaContainer = $("#"+identifier);
    var captchaButton = $(captchaContainer.parent().children()[0]);
    var containerOffset = 5;
    var pageDimensions = {
        height: $(document).height(),
        width: $(document).width()
    };

    if(captchaContainer.hasClass("visible"))
    {
        captchaContainer.removeClass("visible");
        captchaContainer.addClass("hidden");
        return;
    }

    captchaContainer.removeClass("hidden");
    captchaContainer.addClass("visible");

    var captchaButtonPosition = captchaButton.offset();
    var captchaContainerPositions = {
        above: {
            top: captchaButtonPosition.top - (captchaContainer.outerHeight() + containerOffset),
            left: captchaButton.offset().left
        },
        bellow: {
            top: captchaButtonPosition.top + (captchaButton.outerHeight() + containerOffset),
            left: captchaButton.offset().left
        },
        left: {
            top: (captchaButtonPosition.top  + captchaButton.outerHeight()) - captchaContainer.outerHeight(),
            left: captchaButton.offset().left - (captchaContainer.outerWidth() + containerOffset)
        },
        right: {
            top: (captchaButtonPosition.top  + captchaButton.outerHeight()) - captchaContainer.outerHeight(),
            left: captchaButton.offset().left + captchaButton.outerWidth() + containerOffset
        }
    };

    if (!(captchaContainerPositions.above.top < 0))
    {
        captchaContainer.offset(captchaContainerPositions.above);
        return;
    }

    if (!(captchaContainerPositions.left.top < 0 || captchaContainerPositions.left.left < 0))
    {
        captchaContainer.offset(captchaContainerPositions.left);
        return;
    }

    if (!(captchaContainerPositions.right.top < 0 || captchaContainerPositions.right.left > pageDimensions.width))
    {
        captchaContainer.offset(captchaContainerPositions.right);
        return;
    }

    if (!((captchaContainerPositions.bottom + captchaContainer.outerHeight()) > pageDimensions.height)) {
        captchaContainer.offset(captchaContainerPositions.bellow);
        return;
    }
}