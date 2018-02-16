$.fn.mycaptcha = function(configuration) {
    var elements = {
        loadingBar: null,
        targetElement: $(this),
        captchaButton: null,
        captchaPopupContainer: null,
        captchaContainer: null,
        captchaUI: {
            titleLabel: null,
            verifyButton: null,
            reloadButton: null
        },
        captchaType: null,
        captchaID: null,
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
    var audioCaptcha = {
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
            elements.loadingBar = $("<div class=\"loader\"></div>").appendTo(elements.captchaPopupContainer);
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
        console.log(result);
        elements.captchaUI.titleLabel.empty().append(result.context);
        elements.captchaType = result.captchaType;
        elements.captchaID =  result.captchaID;
        switch(elements.captchaType)
        {
            case "Image":
                elements.captchaPopupContainer.addClass("captcha-container-image");
                createImageCaptcha(result.content);
                break;
            case "Audio":
                elements.captchaPopupContainer.addClass("captcha-container-audio");
                createAudioCaptcha(result.content);
                break;
            default:
                displayCaptchaContainer();
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
        console.log(images);
        for (var i = 0; i < images.length; i++) {
            var container = $("<div class='col-xs-6'></div>").appendTo(imageCaptcha.captchaLayout);
            var imageContainer = $("<div class='captcha-image-container'></div>").appendTo(container);
            var imageSelectionButton = $("<a data-value='"+ images[i].value +"' class='captcha-image-button'></a>").appendTo(imageContainer);
            $("<img class='rounded captcha-image' src='"+ images[i].data +"' />").appendTo(imageSelectionButton);
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

    var createAudioCaptcha = function(audio)
    {
        audioCaptcha.captchaContainer = $("<div class='container-fluid'></div>").appendTo(elements.captchaContainer);
        audioCaptcha.captchaLayout = $("<div class='row align-content-center'></div>").appendTo(audioCaptcha.captchaContainer);
        var row =  $("<div class='col-md-12'></div>").appendTo(audioCaptcha.captchaLayout);
        var list = $("<ul class=\"list-group\"></ul>").appendTo(row);

        console.log(audio);
        for (var i = 0; i < audio.length; i++) {
            var listItem = $(" <li class=\"list-group-item\"></li>\n").appendTo(list);
            $("<audio controls class='audioControl'><source src=\""+ audio[i].data+"\" type=\"audio/ogg\">Your browser does not support the audio element.</audio>     <div class=\"form-check\">\n" +
                "    <label class=\"form-check-label\">\n" +
                "        <input type=\"radio\" class=\"form-check-input captcha-radio\" name=\"captchaRadio\" data-value=\""+ audio[i].value+"\">\n" +
                "        This sounds like the correct answer" +
                "      </label>\n" +
                "    </div>").appendTo(listItem);
        }

        $(".captcha-radio").change(function()
        {
            userData.selected = $(this);
            console.log(userData.selected);
        })
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

        resizeCaptcha();
    };

    var resizeCaptcha = function() {
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
    };

    var verifyCaptcha = function()
    {
        if (userData.selected == null)
        {
            alert("Attention - you must select something!");
            return;
        }

        $.post("http://localhost:3000/verifyCaptcha", {
            apiToken: sha256(configuration.apiKey),
            result: userData.selected.attr("data-value"),
            captchaID: elements.captchaID,
            captchaType: elements.captchaType
        }).done(function(result) {

            if (!result)
            {
                reloadCaptcha();
                return;
            }

            if (configuration.verified() !== undefined){
                configuration.verified();
            }

            displayCaptchaContainer();
        });

        console.log("sent");
    };

    var reloadCaptcha = function()
    {
        elements.captchaUI.titleLabel.empty();
        elements.captchaContainer.empty();
        userData.selected = null;

        elements.captchaContainer.append("<div class=\"spinner\">\n" +
            "  <div class=\"rect1\"></div>\n" +
            "  <div class=\"rect2\"></div>\n" +
            "  <div class=\"rect3\"></div>\n" +
            "  <div class=\"rect4\"></div>\n" +
            "  <div class=\"rect5\"></div>\n" +
            "</div>");

        resizeCaptcha();
        $.post("http://localhost:3000/requestCaptcha", {
            apiToken: sha256(configuration.apiKey)
        }).done(function(result) {
            elements.captchaContainer.empty();
            createCaptcha(result);
            resizeCaptcha();
        });
    }
};