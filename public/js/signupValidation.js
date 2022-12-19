console.log('validating');

$("#formValidation").validate({
rules: {
name: {
    minlength: 4,
    required: true,
    },
email: {
    email: true,
    }, 
password: {
    required: true,
    checkpassword: true,
    },
confirmpassword: {
    required: true,
    equalTo: "#password",
    },
phoneNo: {
    number: true,
    minlength: 10,
    maxlength: 10,
    },
}, messages: {
name: {
required: "Please enter name",
minlength: "Requires minimum of 3 characters"
    },
email:{
required : "Please enter your email Id"
},
username: {
    required: "Please enter username",
    minlength: "Requires minimum of 4 characters"
    },
confirmpassword: {
    required: "Please confirm the password", 
    equalTo: "Password doesn't match"
    },
phoneNo: {
    required: "Please enter the mobile number",
    minlength: "Required 10 digits",
    maxlength: "Cannot be more than 10 digits"
}
},

submitHandler: function (form) {
    form.submit();
     }
     });

     jQuery.validator.addMethod(
        "checkpassword",
    function(value, element) {

        return(
        this.optional (element) || /^(?=.*?[A-Z])(?=(..*[a-z]){1,})(?=(.*[\d]){1,})(?=(.*[\W]){1,})(?!.*\s).{8,}$/i.test(
            value
        )
        )
        }, 
        "Password must be alphanumeric (@,_and-are also allowed) and be 8 - 20 characters"
        );
//^[\w@-]{8,20}$