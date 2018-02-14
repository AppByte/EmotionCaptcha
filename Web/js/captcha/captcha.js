$.fn.mycaptcha = function(configuration) {
    var elements = {
        targetElement: $(this),
        captchaButton: null,
        captchaPopupContainer: null,
        captchaContainer: null,
        captchaUI: {
            titleLabel: null,
            verifyButton: null,
            reloadButton: null
        }
    };
    var dimensions = {
        page: {
            height: $(document).height(),
            width: $(document).width()
        },
        containerOffset: 10
    };
    var imageCaptcha = {
        captchaContainer: null,
        captchaLayout: null
    };
    var userData = {
        selected: null
    };

    $.post("http://localhost:3000/requestToken", {
        apiToken: sha256(configuration.apiKey)
    }).done(function(result) {
        var captchaID = result.token.substring(Math.floor(Math.random() * result.token.length), Math.floor(Math.random() * result.token.length));
        var captchaContainerID = result.token.substring(Math.floor(Math.random() * result.token.length), Math.floor(Math.random() * result.token.length));
        elements.captchaButton = $(createCaptchaButton(captchaID));
        elements.captchaPopupContainer = $(createCaptchaContainer(captchaContainerID));
        getCaptcha();
    });

    var getCaptcha = function() {
        $.post("http://localhost:3000/requestCaptcha", {
            apiToken: sha256(configuration.apiKey)
        }).done(function(result) {
            elements.captchaButton.appendTo(elements.targetElement);
            elements.captchaPopupContainer.appendTo(elements.targetElement);
            createCaptchaUI();
            elements.captchaContainerContent = $(createCaptcha(result)).appendTo(elements.captchaPopupContainer);
            elements.captchaButton.click(function() {
                displayCaptchaContainer();
            });
        });
    };

    var createCaptchaButton = function(identifier) {
        return "<button class=\'btn btn-outline-success\' id='"+identifier+"'>Verify</button>";
    };
    var createCaptchaContainer = function(identifier) {
        return "<div class='captcha-popup-container hidden'id='" + identifier + "'></div>"
    };
    var createCaptcha = function(result) {
        elements.captchaUI.titleLabel.empty().append(result.question);
        switch(result.captchaType)
        {
            case "image":
                elements.captchaPopupContainer.addClass("captcha-container-image");
                createImageCaptcha(result.images);
                break;
        }
    };
    var createCaptchaUI = function()
    {
        var headerContainer = $("<div class='captcha-header-container'></div>").appendTo(elements.captchaPopupContainer);
        elements.captchaUI.titleLabel = $("<label class='captcha-question-label'></label>").appendTo(headerContainer);
        elements.captchaPopupContainer.append("<div class='captcha-separator'></div>");
        elements.captchaContainer = $("<div class='captcha'></div>").appendTo(elements.captchaPopupContainer);
        elements.captchaPopupContainer.append("<div class='captcha-separator'></div>");
        var footerContainer =$("<div class='captcha-foo-container'></div>").appendTo(elements.captchaPopupContainer);
        elements.captchaUI.verifyButton = $("<button class='btn btn-captcha-verify-outline captcha-verify-button'>Verify</button>").appendTo(footerContainer);
        elements.captchaUI.reloadButton = $("<a class='captcha-reload-button'><i class='fas fa-sync'></i></a>").appendTo(footerContainer);

        elements.captchaUI.verifyButton.click(verifyCaptcha);
        elements.captchaUI.reloadButton.click(reloadCaptcha);
    };

    var createImageCaptcha = function(images)
    {
        imageCaptcha.captchaContainer = $("<div class='container-fluid'></div>").appendTo(elements.captchaContainer);
        imageCaptcha.captchaLayout = $("<div class='row align-content-center'></div>").appendTo(imageCaptcha.captchaContainer);
        imageCaptcha.captchaLayout.empty();
        for (var i = 0; i < images.length; i++) {
            var container = $("<div class='col-xs-6'></div>").appendTo(imageCaptcha.captchaLayout);
            var imageContainer = $("<div class='captcha-image-container'></div>").appendTo(container);
            var imageSelectionButton = $("<a data-value='"+ images[i].id +"' class='captcha-image-button'></a>").appendTo(imageContainer);
            $("<img class='rounded captcha-image' src='"+ images[i].url +"' />").appendTo(imageSelectionButton);
            var checkIcon = $("<div class='captcha-image-check hidden'><i class='far fa-check-circle'></i></div>").appendTo(imageContainer);
            imageSelectionButton.click(function() {

                if (userData.selected != null)
                {
                    $(userData.selected.parent().children()[1]).removeClass("visible").addClass("hidden");
                    userData.selected.children().removeClass("captcha-image-check-background");
                }

                userData.selected = $(this);
                $(this).parent().children().removeClass("hidden").addClass("visible");
                $(this).children().addClass("captcha-image-check-background");
            });
        }
    };

    var displayCaptchaContainer = function () {
        if(elements.captchaPopupContainer.hasClass("visible"))
        {
            elements.captchaPopupContainer.removeClass("visible");
            elements.captchaPopupContainer.addClass("hidden");
            return;
        }

        elements.captchaPopupContainer.removeClass("hidden");
        elements.captchaPopupContainer.addClass("visible");

        var captchaButtonPosition = elements.captchaButton.offset();
        var captchaContainerPositions = {
            above: {
                top: captchaButtonPosition.top - (elements.captchaPopupContainer.outerHeight() + dimensions.containerOffset),
                left: elements.captchaButton.offset().left
            },
            bellow: {
                top: captchaButtonPosition.top + (elements.captchaButton.outerHeight() + dimensions.containerOffset),
                left: elements.captchaButton.offset().left
            },
            left: {
                top: (captchaButtonPosition.top  + elements.captchaButton.outerHeight()) - elements.captchaPopupContainer.outerHeight(),
                left: elements.captchaButton.offset().left - (elements.captchaPopupContainer.outerWidth() + dimensions.containerOffset)
            },
            right: {
                top: (captchaButtonPosition.top  + elements.captchaButton.outerHeight()) - elements.captchaPopupContainer.outerHeight(),
                left: elements.captchaButton.offset().left + elements.captchaButton.outerWidth() + dimensions.containerOffset
            }
        };

        if (configuration.orientation !== undefined)
        {
            elements.captchaPopupContainer.offset(captchaContainerPositions[configuration.orientation]);
            return;
        }

        if (!(captchaContainerPositions.above.top < 0))
        {
            elements.captchaPopupContainer.offset(captchaContainerPositions.above);
            return;
        }

        if (!(captchaContainerPositions.left.top < 0 || captchaContainerPositions.left.left < 0))
        {
            elements.captchaPopupContainer.offset(captchaContainerPositions.left);
            return;
        }

        if (!(captchaContainerPositions.right.top < 0 || captchaContainerPositions.right.left > dimensions.page.width))
        {
            elements.captchaPopupContainer.offset(captchaContainerPositions.right);
            return;
        }

        if (!((captchaContainerPositions.bottom + elements.captchaPopupContainer.outerHeight()) > dimensions.page.height)) {
            elements.captchaPopupContainer.offset(captchaContainerPositions.bellow);
            return;
        }
    }

    var verifyCaptcha = function()
    {
        if (userData.selected == null)
        {
            alert("Attention - you must select something!");
            return;
        }

        alert(userData.selected.attr("data-value"));

        $.post("http://localhost:3000/verifyCaptcha", {
            apiToken: sha256(configuration.apiKey),
            result: userData.selected.attr("data-value")
        }).done(function(result) {
            if (configuration.verified() !== undefined){
                configuration.verified();
            };
        });
    }

    var reloadCaptcha = function()
    {
        elements.captchaUI.titleLabel.empty();
        elements.captchaContainer.empty();
        userData.selected = null;

        $.post("http://localhost:3000/requestCaptcha", {
            apiToken: sha256(configuration.apiKey)
        }).done(function(result) {
            createCaptcha(result);
        });
    }
};