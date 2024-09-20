'use strict';

function CreateCookie(name, value, days) {

    var expires;

    if (days) {

        var date = new Date();

        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));

        expires = "; expires=" + date.toGMTString();

    } else {

        expires = "";

    }

    document.cookie = name + "=" + value + expires + "; path=/";

}

function GetCookie(cname) {

    let name = cname + "=";

    let decodedCookie = decodeURIComponent(document.cookie);

    let ca = decodedCookie.split(';');

    for (let i = 0; i < ca.length; i++) {

        let c = ca[i];

        while (c.charAt(0) == ' ') {

            c = c.substring(1);

        }

        if (c.indexOf(name) == 0) {

            return c.substring(name.length, c.length);

        }

    }

    return "";

}

// SweetAlertManager

var SweetAlertManager = (function () {
    return {
        init: function (config) {
            return Swal.fire(config).then((result) => {
                if (result.isConfirmed) {
                    return "Confirmed";
                } else if (result.isDenied) {
                    return "Denied";
                } else {
                    return "Dismissed";
                }
            });
        }
    };
})();

function setValueById(id, value) {
    $(id).val(value);
}

function scrollToBottom() {
    try {
        var chatBlocks = document.querySelectorAll('.chat-block');
        var lastChatBlock = chatBlocks[chatBlocks.length - 1];
        lastChatBlock.scrollIntoView({behavior: "smooth", block: "center", inline: "center"});
    } catch (error) {

    } finally {

    }

}


// BootstrapModal
var BootstrapModal = (function () {
    let bootstrapModalInstances = {};

    function init(modalId, instanceId, options) {
        let bootstrapModalInstanceElement = document.querySelector(modalId);
        let bootstrapModalInstance = new bootstrap.Modal(bootstrapModalInstanceElement, options)
        bootstrapModalInstances[instanceId] = bootstrapModalInstance;
        return bootstrapModalInstance;
    }

    return {
        init: init,
        toggle: function (instanceId) {
            let e = bootstrapModalInstances[instanceId];
            e.toggle()
        },
        show: function (instanceId) {
            let e = bootstrapModalInstances[instanceId];
            e.show()
        },
        hide: function (instanceId) {
            let e = bootstrapModalInstances[instanceId];
            e.hide()
        },
        removeInstance: function (instanceId) {
            let e = bootstrapModalInstances[instanceId];
            if (e) {
                e.dispose();
                delete bootstrapModalInstances[instanceId];
            }
        }
    };
})();

var jsRuntimeInstanceCurrent;

function CallBackCSharp(functionName, ...params) {
    jsRuntimeInstanceCurrent.invokeMethodAsync(functionName, ...params);
}


// BootstrapDataTable
var BootstrapDataTable = (function () {
    let dataTableInstances = {};

    function init(tableId, instanceId, options, jsRuntimeInstance) {
        jsRuntimeInstanceCurrent = jsRuntimeInstance;
        let accessToken = getLocalStorageValue("access_token").replace(/"/g, '');
        options.columns.forEach(function (item, index) {
            if (options.columns[index].rerender === true) {
                let name = options.columns[index].name;
                options.columns[index].render = function (data, type, row, meta) {
                    try {
                        return jsRuntimeInstance.invokeMethod("OnRender", name, data, type, row, meta);
                    } catch (error) {
                        console.log(error);
                    }

                    return data;
                }
            } else {
                options.columns[index].render = function (data, type, row, meta) {
                    return data;
                }
            }
            options.columns[index].rerender = null;

        });
        options.ajax.beforeSend = function (xhr) {
            xhr.setRequestHeader('Authorization', 'Bearer ' + accessToken);
        };

        options.ajax.dataFilter = function (data) {
            var json = jsRuntimeInstance.invokeMethod("OnDataFilter", instanceId, data);
            return json;
        }

        options.createdRow = function (row, data, dataIndex) {
            if (data["color_row"] !== undefined) {
                $(row).addClass(data["color_row"]);
            }
        }
        options.ajax.error = function (xhr, error, code) {
            if (xhr.status === 401) {
                window.location.reload();
            } else {
                toastr["error"](xhr.responseText);
            }
        }
        let dataTableInstance = new DataTable(tableId, options);
        dataTableInstances[instanceId] = dataTableInstance;
        // dataTableInstance.on('draw.dt', function () {
        //     let api = new DataTable.Api(dataTableInstance);
        //     let pagination = api.page.info();
        //     jsRuntimeInstance.invokeMethodAsync('OnPaginationChanged', instanceId, pagination.start, pagination.length);
        // });
        return dataTableInstance;
    }

    return {
        init: init,
        updateData: function (instanceId, data) {
            let e = dataTableInstances[instanceId];
            e.clear();
            e.rows.add(data);
            e.draw();
        },
        updateOptions: function (instanceId, options) {
            let e = dataTableInstances[instanceId];
            if (e) {
                e.destroy();
                init('#' + e.table().node().id, instanceId, options);
            }
        },
        reload: function (instanceId, resetPaging = false) {
            let e = dataTableInstances[instanceId];
            e.ajax.reload(null, !resetPaging);
        },
        removeInstance: function (instanceId) {
            let e = dataTableInstances[instanceId];
            if (e) {
                e.destroy();
                delete dataTableInstances[instanceId];
            }
        }
    };
})();

// DateTimePickerExtension
var DateTimePickerExtension = (function () {
    let dateTimePickerInstances = {};

    function init(inputId, instanceId, options) {
        let dateTimePickerInstanceElement = $(`${inputId}`);
        dateTimePickerInstanceElement.datetimepicker(options);
        dateTimePickerInstances[instanceId] = dateTimePickerInstanceElement;
        return dateTimePickerInstanceElement;
    }

    return {
        init: init,
        setDate: function (instanceId, date) {
            let e = dateTimePickerInstances[instanceId];
            if (e) {
                e.data('datetimepicker').date(date !== null ? moment(date, 'DD/MM/yyyy HH:ss') : date);
            }
        },
        getDate: function (instanceId) {
            let e = dateTimePickerInstances[instanceId];
            if (e) {
                try {
                    let dateString = moment(e.datetimepicker("date")).format('DD/MM/yyyy HH:ss');
                    if (dateString === 'Invalid date') {
                        return "";
                    } else {
                        return dateString;
                    }
                } catch (e) {
                    return "";
                }

            }
            return null;
        },
        removeInstance: function (instanceId) {
            let e = dateTimePickerInstances[instanceId];
            if (e) {
                e.datetimepicker('destroy');
                delete dateTimePickerInstances[instanceId];
            }
        }
    };
})();

// LoadingButtonExtension
var LoadingButtonExtension = (function () {
    let loadingButtonInstances = {};

    function init(buttonId, instanceId) {
        let buttonElement = document.querySelector(buttonId);
        buttonElement.setAttribute('data-original-class', buttonElement.classList);
        buttonElement.setAttribute('data-original-html', buttonElement.innerHTML);
        loadingButtonInstances[instanceId] = buttonElement;
    }

    function startLoading(instanceId, disabled = true, btn_class = null, btn_text = null) {
        let buttonElement = loadingButtonInstances[instanceId];
        if (disabled) {
            buttonElement.disabled = true;
            buttonElement.classList.add("disabled");
        }

        if (btn_class != null) {
            buttonElement.classList.remove("btn-primary");
            buttonElement.classList.remove("btn-secondary");
            buttonElement.classList.remove("btn-success");
            buttonElement.classList.remove("btn-info");
            buttonElement.classList.remove("btn-warning");
            buttonElement.classList.remove("btn-danger");
            buttonElement.classList.remove("btn-light");
            buttonElement.classList.remove("btn-dark");
            buttonElement.classList.remove("btn-link");
            buttonElement.classList.add(btn_class);
        }

        let originalInnerHTML = buttonElement.getAttribute('data-original-html');
        buttonElement.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> ' + (btn_text !== null ? btn_text : originalInnerHTML);
    }

    function stopLoading(instanceId) {
        let buttonElement = loadingButtonInstances[instanceId];
        let originalInnerHTML = buttonElement.getAttribute('data-original-html');
        let originalClass = buttonElement.getAttribute('data-original-class');
        buttonElement.disabled = false;
        buttonElement.classList.remove("disabled");
        buttonElement.classList = originalClass;
        buttonElement.innerHTML = originalInnerHTML;
    }

    return {
        init: init,
        startLoading: startLoading,
        stopLoading: stopLoading
    };
})();

// ToastrExtension
var ToastrExtension = (function () {
    function showSuccess(message) {
        toastr["success"](message);
    }

    function showInfo(message) {
        toastr["info"](message);
    }

    function showWarning(message) {
        toastr["warning"](message);
    }

    function showError(message) {
        toastr["error"](message);
    }

    function getOptions() {
        return toastr.options;
    }

    function setOptions(options) {
        toastr.options = JSON.parse(options);
    }

    return {
        showSuccess: showSuccess,
        showInfo: showInfo,
        showWarning: showWarning,
        showError: showError,
        getOptions: getOptions,
        setOptions: setOptions
    };
})();

// FormValidatorExtension
var FormValidatorExtension = (function () {
    let formValidatorInstances = {};

    function init(formId, instanceId, options) {
        let formValidate = $(`${formId}`).validate({
            rules: options.rules,
            messages: options.messages,
            errorElement: options.errorElement,
            errorPlacement: eval(options.errorPlacementFunction),
            highlight: eval(options.highlightFunction),
            unhighlight: eval(options.unhighlightFunction)
        });

        formValidatorInstances[instanceId] = formValidate;
    }

    function validate(instanceId) {
        let formValidate = formValidatorInstances[instanceId];
        return formValidate.form()
    }

    function isValid(instanceId) {
        let formValidate = formValidatorInstances[instanceId];
        return formValidate.checkForm();
    }

    function removeInstance(instanceId) {
        let e = formValidatorInstances[instanceId];
        if (e) {
            e.destroy();
            delete formValidatorInstances[instanceId];
        }
    }

    return {
        init: init,
        validate: validate,
        isValid: isValid,
        removeInstance: removeInstance
    };
})();

// CodeMirrorExtension
var CodeMirrorExtension = (function () {
    let codeMirrorInstances = {};

    function init(textareaId, instanceId, options) {
        options.extraKeys = {
            "F11": function (cm) {
                cm.setOption("fullScreen", !cm.getOption("fullScreen"));
            },
            "Esc": function (cm) {
                if (cm.getOption("fullScreen")) cm.setOption("fullScreen", false);
            }
        };
        let codeMirrorInstance = CodeMirror.fromTextArea(document.querySelector(textareaId), options);
        codeMirrorInstances[instanceId] = codeMirrorInstance;
        return codeMirrorInstance;
    }

    return {
        init: init,
        getValue: function (instanceId) {
            let instance = codeMirrorInstances[instanceId];
            if (instance) {
                return instance.getValue();
            }
            return "";
        },
        setValue: function (instanceId, value) {
            let instance = codeMirrorInstances[instanceId];
            if (instance) {
                instance.setValue(value);
                instance.scrollTo(0, instance.lineCount() * instance.defaultTextHeight());
                // setTimeout(function() {
                //     instance.refresh();
                // },100);
            }
        },
        setMode: function (instanceId, mode) {
            let instance = codeMirrorInstances[instanceId];
            if (instance) {
                instance.setOption("mode", mode);
            }
        },
        setSize: function (instanceId, width = null, height = null) {
            let instance = codeMirrorInstances[instanceId];
            if (instance) {
                instance.setSize(width, height);
            }
        },
        goToEnd: function (instanceId) {
            let instance = codeMirrorInstances[instanceId];
            if (instance) {
                instance.scrollTo(0, instance.lineCount() * instance.defaultTextHeight());
            }
        },
        refresh: function (instanceId) {
            let instance = codeMirrorInstances[instanceId];
            if (instance) {
                instance.refresh();
            }
        },
        save: function (instanceId) {
            let instance = codeMirrorInstances[instanceId];
            if (instance) {
                instance.save();
            }
        },
        removeInstance: function (instanceId) {
            let instance = codeMirrorInstances[instanceId];
            if (instance) {
                instance.toTextArea(); // Convert back to <textarea>
                delete codeMirrorInstances[instanceId];
            }
        }
    };
})();


// Select2Extension
var Select2Extension = (function () {
    let select2Instances = {};

    function init(selectId, instanceId, options) {
        if (options.templateSelectionFunction !== "") {
            options.templateSelection = eval(options.templateSelectionFunction)
        }
        if (options.templateResultFunction !== "") {
            options.templateResult = eval(options.templateResultFunction)
        }
        if (options.dropdownParentId !== "") {
            options.dropdownParent = options.dropdownParentId
        }

        let select2Instance = $(selectId).select2(options);
        select2Instances[instanceId] = select2Instance;
        return select2Instance;
    }

    return {
        init: init,
        getValue: function (instanceId) {
            let instance = select2Instances[instanceId];
            if (instance) {
                return instance.val();
            }
            return null;
        },
        setValue: function (instanceId, value) {
            let instance = select2Instances[instanceId];
            if (instance) {
                if (value !== "") {
                    instance.val(value).trigger("change");
                } else {
                    //TODO: add default login here
                }
            }
        },
        // Add other methods for Select2 as needed
    };
})();


//copyToClipboard
function copyToClipboard(textToCopy) {
    var tempInput = document.createElement("input");
    tempInput.value = textToCopy;
    document.body.appendChild(tempInput);
    tempInput.select();
    document.execCommand("copy");
    document.body.removeChild(tempInput);
    toastr.success(`Copied token to clipboard`)
}

function copyDecodeToClipboard(textToCopy) {
    var tempInput = document.createElement("input");
    tempInput.value = "" + decodeURIComponent(textToCopy);
    document.body.appendChild(tempInput);
    tempInput.select();
    document.execCommand("copy");
    document.body.removeChild(tempInput);
    toastr.success(`Copied token to clipboard`)
}


// removeBackdrop
function removeBackdrop() {
    const backdrop = document.querySelector('.modal-backdrop.fade.show');
    if (backdrop) {
        backdrop.remove();
    }
}

// getLocalStorageValue
function getLocalStorageValue(key) {
    return localStorage.getItem(key);
}

//formatJSON
function formatJSON(jsonInput) {
    try {
        const json = JSON.parse(jsonInput);
        return JSON.stringify(json, null, 4);
    } catch (error) {
        return jsonInput;
    }
}

//check and formatJSON
function checkJSON(str) {
    if (typeof str !== 'string') {
        return false;
    }

    str = str.trim(); // Loại bỏ các khoảng trắng đầu và cuối

    if ((str.startsWith('{') && str.endsWith('}')) || (str.startsWith('[') && str.endsWith(']'))) {
        try {
            JSON.parse(str);
            return true;
        } catch (e) {
            return false;
        }
    }

    return false;
}

//format HTML
function formatHTML(htmlInput) {
    try {
        const options = {
            "indent_size": 4,
            "indent_char": " ",
            "indent_with_tabs": false,
            "editorconfig": false,
            "eol": "\n",
            "end_with_newline": false,
            "indent_level": 0,
            "preserve_newlines": true,
            "max_preserve_newlines": 10,
            "space_in_paren": false,
            "space_in_empty_paren": false,
            "jslint_happy": false,
            "space_after_anon_function": false,
            "space_after_named_function": false,
            "brace_style": "collapse",
            "unindent_chained_methods": false,
            "break_chained_methods": false,
            "keep_array_indentation": false,
            "unescape_strings": false,
            "wrap_line_length": 0,
            "e4x": false,
            "comma_first": false,
            "operator_position": "before-newline",
            "indent_empty_lines": false,
            "templating": ["auto"]
        }
        return html_beautify(htmlInput, options)
    } catch (error) {
        return htmlInput;
    }
}


//Custom response select2 for llm model
function formatNumberWithK(number) {
    if (number >= 1000) {
        return Math.round(number / 1000) + 'k';
    }
    return number;
}


function CustomSelect2LlmModel(item) {
    const models = JSON.parse(getLocalStorageValue("model_ais"))
    let modelInfo = models.find(model => model.Name === item.text);

    let imageSrc = 'dist/img/llm-model/default.png';
    let badgeText = 'None';
    let badgeColor = 'badge-info';
    let tokenBadgeText = '';
    let tokenBadgeColor = 'badge-secondary';

    if (modelInfo) {
        imageSrc = modelInfo.Icon;
        badgeText = modelInfo.Tag;
        badgeColor = modelInfo.Tag === 'PRO' ? 'badge-warning' : (modelInfo.Tag === 'FREE' ? 'badge-success' : 'badge-info');
        tokenBadgeText = formatNumberWithK(modelInfo.Maximum_context_length);
        tokenBadgeColor = 'badge-secondary';
    } else {
        if (item.text === 'HuggingFace') {
            imageSrc = 'dist/img/llm-model/huggingface_logo-noborder.svg';
            badgeText = '';
            badgeColor = 'badge-info';
            tokenBadgeText = '';
        } else if (item.text === 'OpenRouter') {
            imageSrc = 'dist/img/llm-model/openrouter.jpg';
            badgeText = '';
            badgeColor = 'badge-info';
            tokenBadgeText = '';
        } else if (item.text === 'AzureOpenAI') {
            imageSrc = 'dist/img/llm-model/azure.jpg';
            badgeText = '';
            badgeColor = 'badge-info';
            tokenBadgeText = '';
        } else if (item.text === 'OpenAI') {
            imageSrc = 'dist/img/llm-model/GPT-3.5.png';
            badgeText = '';
            badgeColor = 'badge-info';
            tokenBadgeText = '';
        }
    }


    const html = $(`<div class="row">
                    <div class="col-sm-1">
                        <img style="height: 21px;" src="${imageSrc}" alt="">
                    </div>
                    <div class="col-sm-8">${item.text}
                    </div>
                    <div class="col-sm-3" style="align-content: center;">
                        ${badgeColor !== "" ? (`<span class="badge ${badgeColor}" style="float: right;">${badgeText}</span>`) : ""}
                        ${tokenBadgeText ? (`<span class="badge ${tokenBadgeColor}" style="float: right; margin-right: 2px;">${tokenBadgeText} context </span>`) : ""} 
                    </div>
                </div>`);

    return html;
}

// Example usage:
// CustomSelect2LlmModel({ text: 'HuggingFaceH4/zephyr-orpo-141b-A35b-v0.1' }).then(html => {
//     $('#select2-model-container').append(html);
// });

function CustomSelect2LlmModelOld(item) {
    let modelName = item.text;
    let imageSrc;
    let badgeText;
    let tokenBadgeText = '4K';
    let tokenBadgeColor = 'badge-secondary';
    let badgeColor;

    if (modelName === 'HuggingFaceH4/zephyr-orpo-141b-A35b-v0.1') {
        imageSrc = 'dist/img/llm-model/zephyr-logo.png';
        badgeText = 'PRO';
        badgeColor = 'badge-warning';
        tokenBadgeText = '64K';
    } else if (modelName === 'CohereForAI/c4ai-command-r-plus') {
        imageSrc = 'dist/img/llm-model/cohere-logo.png';
        badgeText = 'PRO';
        badgeColor = 'badge-warning';
        tokenBadgeText = '128K';
    } else if (modelName === 'NousResearch/Nous-Hermes-2-Mixtral-8x7B-DPO') {
        imageSrc = 'dist/img/llm-model/nous-logo.png';
        badgeText = 'FREE';
        badgeColor = 'badge-success';
        tokenBadgeText = '32K';
    } else if (modelName === 'google/gemma-1.1-7b-it') {
        imageSrc = 'dist/img/llm-model/google-logo.png';
        badgeText = 'FREE';
        badgeColor = 'badge-success';
        tokenBadgeText = '8K';
    } else if (modelName === 'microsoft/Phi-3-mini-4k-instruct') {
        imageSrc = 'dist/img/llm-model/microsoft-logo.png';
        badgeText = 'FREE';
        badgeColor = 'badge-success';
        tokenBadgeText = '4K';
    } else if (modelName === 'mistralai/Mistral-7B-Instruct-v0.2') {
        imageSrc = 'dist/img/llm-model/mistral-logo.png';
        badgeText = 'FREE';
        badgeColor = 'badge-success';
        tokenBadgeText = '32K';
    } else if (modelName === '01-ai/Yi-1.5-34B-Chat') {
        imageSrc = 'dist/img/llm-model/01-ai-logo.png';
        badgeText = 'FREE';
        badgeColor = 'badge-success';
        tokenBadgeText = '4K';
    } else if (modelName === 'meta-llama/Meta-Llama-3-70B-Instruct') {
        imageSrc = 'dist/img/llm-model/meta-logo.png';
        badgeText = 'PRO';
        badgeColor = 'badge-warning';
        tokenBadgeText = '8K';
    } else if (modelName === 'nousresearch/nous-capybara-7b:free') {
        imageSrc = 'dist/img/llm-model/nous-logo.png';
        badgeText = 'FREE';
        badgeColor = 'badge-success';
        tokenBadgeText = '4K';
    } else if (modelName === 'meta-llama/llama-3-8b-instruct:free') {
        imageSrc = 'dist/img/llm-model/meta-logo.png';
        badgeText = 'FREE';
        badgeColor = 'badge-success';
        tokenBadgeText = '8K';
    } else if (modelName === 'microsoft/phi-3-mini-128k-instruct:free') {
        imageSrc = 'dist/img/llm-model/microsoft-logo.png';
        badgeText = 'FREE';
        badgeColor = 'badge-success';
        tokenBadgeText = '128K';
    } else if (modelName === 'google/gemma-7b-it:free') {
        imageSrc = 'dist/img/llm-model/google-logo.png';
        badgeText = 'FREE';
        badgeColor = 'badge-success';
        tokenBadgeText = '8K';
    } else if (modelName === 'google/gemini-flash-1.5') {
        imageSrc = 'dist/img/llm-model/gemini.png';
        badgeText = 'PAY';
        badgeColor = 'badge-info';
        tokenBadgeText = '2.8M';
    } else if (modelName === 'openai/gpt-3.5-turbo-0125') {
        imageSrc = 'dist/img/llm-model/GPT-3.5.png';
        badgeText = 'PAY';
        badgeColor = 'badge-info';
        tokenBadgeText = '16K';
    } else if (modelName === 'openai/gpt-4-turbo') {
        imageSrc = 'dist/img/llm-model/GPT-4-turbo.png';
        badgeText = 'PAY';
        badgeColor = 'badge-info';
        tokenBadgeText = '128K';
    } else if (modelName === 'HuggingFace') {
        imageSrc = 'dist/img/llm-model/huggingface_logo-noborder.svg';
        badgeText = '';
        badgeColor = 'badge-info';
        tokenBadgeText = '';
    } else if (modelName === 'OpenRouter') {
        imageSrc = 'dist/img/llm-model/openrouter.jpg';
        badgeText = '';
        badgeColor = 'badge-info';
        tokenBadgeText = '';
    } else if (modelName === 'AzureOpenAI') {
        imageSrc = 'dist/img/llm-model/azure.jpg';
        badgeText = '';
        badgeColor = 'badge-info';
        tokenBadgeText = '';
    } else {
        imageSrc = 'dist/img/llm-model/default.png';
        badgeText = 'None';
        badgeColor = 'badge-info';
    }

    return $(`<div class="row">
    <div class="col-sm-1">
        <img style="height: 21px;" src="${imageSrc}" alt="">
    </div>
    <div class="col-sm-8">${item.text}
    </div>
    <div class="col-sm-3" style="align-content: center;">
        ${badgeColor !== "" ? (`<span class="badge ${badgeColor}" style="float: right;">${badgeText}</span>`) : ""}
        ${tokenBadgeText !== "" ? (`<span class="badge ${tokenBadgeColor}" style="float: right; margin-right: 2px;">${tokenBadgeText} context </span>`) : ""} 
    </div>
</div>`);
}

//View file
function displayFileContent(fileUrl, fileFormat) {
    const viewer = document.getElementById('fileViewer');
    viewer.innerHTML = '';

    if (fileFormat === '.jpg' || fileFormat === '.jpeg' || fileFormat === '.png' || fileFormat === '.gif') {
        const img = document.createElement('img');
        img.src = fileUrl;
        img.style.maxWidth = '100%';
        viewer.appendChild(img);
    } else if (['.json', '.py', '.txt', '.html', '.css', '.js'].includes(fileFormat)) {
        fetch(fileUrl)
            .then(response => response.text())
            .then(content => {
                if (fileFormat === '.json') {
                    try {
                        content = JSON.stringify(JSON.parse(content), null, 2);
                    } catch (e) {
                        // Handle JSON parsing error
                    }
                }

                viewer.innerHTML = '<textarea id="codeMirror"></textarea>';
                const editor = CodeMirror.fromTextArea(document.getElementById('codeMirror'), {
                    lineNumbers: true,
                    mode: getCodeMirrorMode(fileFormat),
                    readOnly: true,
                    theme: 'monokai',
                    viewportMargin: Infinity
                });
                editor.setValue(content);
                editor.setSize("100%", "100%");
                editor.scrollTo(0, editor.lineCount() * editor.defaultTextHeight());
                editor.refresh();
            })
            .catch(error => {
                console.error('Error fetching file:', error);
                viewer.textContent = 'Error loading file content';
            });
    } else {
        viewer.textContent = 'Unsupported file format';
    }
}

function getCodeMirrorMode(fileFormat) {
    const modes = {
        '.json': 'application/ld+json',
        '.py': 'python',
        '.txt': 'text/plain',
        '.html': 'htmlmixed',
        '.css': 'css',
        '.js': 'javascript'
    };
    return modes[fileFormat];
}