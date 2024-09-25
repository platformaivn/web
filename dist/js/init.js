'use strict';

function scriptInit() {
    $('ul.nav.nav-pills.nav-sidebar.flex-column').Treeview("init")
    $('div.input-group').SidebarSearch("init")
    
    $.validator.addMethod(
        "regex",
        function (value, element, regexp) {
            if (regexp.constructor != RegExp)
                regexp = new RegExp(regexp);
            else if (regexp.global)
                regexp.lastIndex = 0;
            return this.optional(element) || regexp.test(value);
        },
        "Please check your input."
    );

    $.validator.addMethod("datetime", function (value, element) {
        return this.optional(element) || /^([0-2]\d|3[01])\/(0\d|1[0-2])\/\d{4} (0\d|1\d|2[0-3]):([0-5]\d)$/.test(value);
    }, "Please enter a valid date time in the format dd/MM/yyyy HH:mm");
}
