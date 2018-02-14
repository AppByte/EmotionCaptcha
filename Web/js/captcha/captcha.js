$.fn.mycaptcha = function(configuration) {
    var targetElement = $(this);
    var captchaButton = null;
    var captchaContainer = null;
    var containerOffset = 5;
    var pageDimensions = {
        height: $(document).height(),
        width: $(document).width()
    };

    $.post("http://localhost:3000/requestToken", {
        apiToken: sha256(configuration.apiKey)
    }).done(function(result) {
        var captchaID = result.token.substring(Math.floor(Math.random() * result.token.length), Math.floor(Math.random() * result.token.length));
        var captchaContainerID = result.token.substring(Math.floor(Math.random() * result.token.length), Math.floor(Math.random() * result.token.length));
        captchaButton = $(targetElement.append(createCaptchaButton(captchaID)));
        captchaContainer = $(targetElement.append(createCaptchaContainer(captchaContainerID)));
        captchaButton.click(function() {
            displayCaptchaContainer();
        })
    });

    var createCaptchaButton = function(identifier) {
        return "<button class=\'btn btn-outline-success\' id='"+identifier+"'>Verify</button>";
    };

    var createCaptchaContainer = function(identifier) {
        return "<div class='captcha-container hidden'id='" + identifier + "'></div>"
    };

    var displayCaptchaContainer = function () {
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
};