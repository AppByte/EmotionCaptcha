$.fn.mycaptcha = function(configuration) {
    var elements = {
        targetElement: $(this),
        captchaButton: null,
        captchaContainer: null
    };

    var dimensions = {
        page: {
            height: $(document).height(),
            width: $(document).width()
        },
        containerOffset: 5
    };

    $.post("http://localhost:3000/requestToken", {
        apiToken: sha256(configuration.apiKey)
    }).done(function(result) {
        var captchaID = result.token.substring(Math.floor(Math.random() * result.token.length), Math.floor(Math.random() * result.token.length));
        var captchaContainerID = result.token.substring(Math.floor(Math.random() * result.token.length), Math.floor(Math.random() * result.token.length));
        elements.captchaButton = $(createCaptchaButton(captchaID)).appendTo(elements.targetElement);
        elements.captchaContainer = $(createCaptchaContainer(captchaContainerID)).appendTo(elements.targetElement);
        elements.captchaButton.click(function() {
            displayCaptchaContainer();
        })
    });

    $.post("http://localhost:3000/requestCaptcha", {
        apiToken: sha256(configuration.apiKey)
    }).done(function(result) {
        console.log(result);
        elements.captchaContainerContent = $(createCaptcha(result.captchaType)).appendTo(elements.captchaContainer);
    });

    var createCaptchaButton = function(identifier) {
        return "<button class=\'btn btn-outline-success\' id='"+identifier+"'>Verify</button>";
    };
    var createCaptchaContainer = function(identifier) {
        return "<div class='captcha-container hidden'id='" + identifier + "'></div>"
    };

    var createCaptcha = function() {
        return "<div class='row'><div class='col-md-12'><label>Question:</label>Test</div></div>"
    };

    var displayCaptchaContainer = function () {
        if(elements.captchaContainer.hasClass("visible"))
        {
            elements.captchaContainer.removeClass("visible");
            elements.captchaContainer.addClass("hidden");
            return;
        }

        elements.captchaContainer.removeClass("hidden");
        elements.captchaContainer.addClass("visible");

        var captchaButtonPosition = elements.captchaButton.offset();
        var captchaContainerPositions = {
            above: {
                top: captchaButtonPosition.top - (elements.captchaContainer.outerHeight() + dimensions.containerOffset),
                left: elements.captchaButton.offset().left
            },
            bellow: {
                top: captchaButtonPosition.top + (elements.captchaButton.outerHeight() + dimensions.containerOffset),
                left: elements.captchaButton.offset().left
            },
            left: {
                top: (captchaButtonPosition.top  + elements.captchaButton.outerHeight()) - elements.captchaContainer.outerHeight(),
                left: elements.captchaButton.offset().left - (elements.captchaContainer.outerWidth() + dimensions.containerOffset)
            },
            right: {
                top: (captchaButtonPosition.top  + elements.captchaButton.outerHeight()) - elements.captchaContainer.outerHeight(),
                left: elements.captchaButton.offset().left + elements.captchaButton.outerWidth() + dimensions.containerOffset
            }
        };

        if (configuration.orientation !== undefined)
        {
            elements.captchaContainer.offset(captchaContainerPositions[configuration.orientation]);
            return;
        }

        if (!(captchaContainerPositions.above.top < 0))
        {
            elements.captchaContainer.offset(captchaContainerPositions.above);
            return;
        }

        if (!(captchaContainerPositions.left.top < 0 || captchaContainerPositions.left.left < 0))
        {
            elements.captchaContainer.offset(captchaContainerPositions.left);
            return;
        }

        if (!(captchaContainerPositions.right.top < 0 || captchaContainerPositions.right.left > pageDimensions.width))
        {
            elements.captchaContainer.offset(captchaContainerPositions.right);
            return;
        }

        if (!((captchaContainerPositions.bottom + captchaContainer.outerHeight()) > pageDimensions.height)) {
            elements.captchaContainer.offset(captchaContainerPositions.bellow);
            return;
        }
    }
};