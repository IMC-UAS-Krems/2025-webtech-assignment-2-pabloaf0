
// for the global cart array
var cart = [];

// the discount settings
var DISCOUNT_ITEM_LIMIT = 3;
var DISCOUNT_RATE = 0.10;

// ======== STEP HANDLING ============

function showstep(stepnumber) {
    var totalsteps = 4;
    var i;

    // show or hide the navbar
    var nav = document.getElementById("navigationbar");
    if (nav) {
        if (stepnumber >= 2) {
            nav.classList.add("d-none");
        } else {
            nav.classList.remove("d-none");
        }
    }

    // hide all steps 
    for (i = 1; i <= totalsteps; i++) {
        var section = document.getElementById("step" + i);
        if (section) {
            section.classList.add("d-none");
        }
    }

    // again show or hide the about us y how donations help
    var aboutus = document.getElementById("aboutus");
    var donationshelp = document.getElementById("donationshelp");
    
    if (aboutus) {
        if (stepnumber !== 1) {
            aboutus.classList.add("d-none");
        } else {
            aboutus.classList.remove("d-none");
        }
    }
    
    if (donationshelp) {
        if (stepnumber !== 1) {
            donationshelp.classList.add("d-none");
        } else {
            donationshelp.classList.remove("d-none");
        }
    }

    //i´ve tried to show the step and i have:
    //step 2, to show the update cart and then step 3 to clear and the last one its name says all, update the progress bar
    var active = document.getElementById("step" + stepnumber);
    if (active) {
        active.classList.remove("d-none");
        
        // 
        if (stepnumber === 2) {
            rendercarttable();
        }
        
        if (stepnumber === 3) {
            clearbuyerformvalidation();
        }
    }

    updateprogressbar(stepnumber);
}
//this is basically for caclulating and makes it work the progress bar and i used an if to make it work wherever the client is 
function updateprogressbar(stepnumber) {
    var bar = document.getElementById("progress-bar");
    if (!bar) return;

    var percentage = 25 * stepnumber;
    bar.style.width = percentage + "%";
    bar.setAttribute("aria-valuenow", percentage);

    if (stepnumber === 1) {
        bar.innerText = "Step 1 of 4: Choose products";
    } else if (stepnumber === 2) {
        bar.innerText = "Step 2 of 4: Review cart";
    } else if (stepnumber === 3) {
        bar.innerText = "Step 3 of 4: Buyer details";
    } else if (stepnumber === 4) {
        bar.innerText = "Step 4 of 4: Confirmation";
    }
}

// ========= CART LOGIC ===========
// i added the comments here to explain everything bc this one is a bit longer to put what is everything
// before i made the code i thought about the proccess for what i need
// addtocart, updatecartui, updatecartsummarybadges, rendercarttable, changequantity, removecartitem... all of this are functions that i need to make the proccess works and i introduce some code inside of them
// for example the one that starts in line 188: its the + button to increase quantity that i added a bootstrap class with "+" as a text and i need something to verify that the correct index is used at the end 

function addtocart(name, price) {
    var i;
    var found = false;

    for (i = 0; i < cart.length; i++) {
        if (cart[i].name === name) {
            cart[i].quantity = cart[i].quantity + 1;
            found = true;
        }
    }

    if (!found) {
        cart.push({
            name: name,
            price: price,
            quantity: 1
        });
    }

    updatecartui();
    showglobalmessage('Added "' + name + '" to your cart.', "alert-success");
}

function updatecartui() {
    updatecartsummarybadges();
    rendercarttable();
}

function updatecartsummarybadges() {
    var totalitems = gettotalitemcount();
    var totals = calculatetotals();

    var summaryitemcount = document.getElementById("summaryitemcount");
    var summarytotal = document.getElementById("summarytotal");
    var summarydiscount = document.getElementById("summarydiscount");

    if (summaryitemcount) {
        summaryitemcount.innerText = totalitems;
    }
    if (summarytotal) {
        summarytotal.innerText = totals.total.toFixed(2);
    }
    if (summarydiscount) {
        summarydiscount.innerText = totals.discount.toFixed(2);
    }
}

function rendercarttable() {
    var tbody = document.getElementById("cartbody");
    var i;

    if (!tbody) {
        return;
    }

    tbody.innerHTML = "";

    var totalitems = 0;
    var total = 0;

    for (i = 0; i < cart.length; i++) {
        var item = cart[i];
        var subtotal = item.price * item.quantity;

        totalitems = totalitems + item.quantity;
        total = total + subtotal;

        var row = document.createElement("tr");

        var tdname = document.createElement("td");
        tdname.innerText = item.name;

        var tdquantity = document.createElement("td");
        tdquantity.innerText = item.quantity;

        var tdprice = document.createElement("td");
        tdprice.innerText = "€" + item.price.toFixed(2);

        var tdsubtotal = document.createElement("td");
        tdsubtotal.innerText = "€" + subtotal.toFixed(2);

        var tdactions = document.createElement("td");

        var btnminus = document.createElement("button");
        btnminus.type = "button";
        btnminus.className = "btn btn-sm btn-outline-secondary me-1";
        btnminus.innerText = "-";
        btnminus.onclick = (function (index) {
            return function () { changequantity(index, -1); };
        })(i);

        var btnplus = document.createElement("button");
        btnplus.type = "button";
        btnplus.className = "btn btn-sm btn-outline-secondary me-1";
        btnplus.innerText = "+";
        btnplus.onclick = (function (index) {
            return function () { changequantity(index, 1); };
        })(i);

        var btnremove = document.createElement("button");
        btnremove.type = "button";
        btnremove.className = "btn btn-sm btn-outline-danger";
        btnremove.innerText = "Remove";
        btnremove.onclick = (function (index) {
            return function () { removecartitem(index); };
        })(i);

        tdactions.appendChild(btnminus);
        tdactions.appendChild(btnplus);
        tdactions.appendChild(btnremove);

        row.appendChild(tdname);
        row.appendChild(tdquantity);
        row.appendChild(tdprice);
        row.appendChild(tdsubtotal);
        row.appendChild(tdactions);

        tbody.appendChild(row);
    }

    var totals = calculatetotals();

    var cartitemscount = document.getElementById("cartitemscount");
    var carttotal = document.getElementById("carttotal");
    var cartdiscount = document.getElementById("cartdiscount");
    var cartfinal = document.getElementById("cartfinal");

    if (cartitemscount) {
        cartitemscount.innerText = totalitems;
    }
    if (carttotal) {
        carttotal.innerText = totals.total.toFixed(2);
    }
    if (cartdiscount) {
        cartdiscount.innerText = totals.discount.toFixed(2);
    }
    if (cartfinal) {
        cartfinal.innerText = totals.final.toFixed(2);
    }
}

function changequantity(index, delta) {
    if (index < 0 || index >= cart.length) {
        return;
    }

    cart[index].quantity = cart[index].quantity + delta;

    if (cart[index].quantity <= 0) {
        cart.splice(index, 1);
    }

    updatecartui();
}

function removecartitem(index) {
    if (index < 0 || index >= cart.length) {
        return;
    }

    cart.splice(index, 1);
    updatecartui();
}

function gettotalitemcount() {
    var i;
    var count = 0;
    for (i = 0; i < cart.length; i++) {
        count = count + cart[i].quantity;
    }
    return count;
}

function calculatetotals() {
    var total = 0;
    var totalitems = 0;
    var i;

    for (i = 0; i < cart.length; i++) {
        totalitems = totalitems + cart[i].quantity;
        total = total + (cart[i].price * cart[i].quantity);
    }

    var discount = 0;
    if (totalitems >= DISCOUNT_ITEM_LIMIT) {
        discount = total * DISCOUNT_RATE;
    }

    var finalamount = total - discount;

    return {
        total: total,
        discount: discount,
        final: finalamount
    };
}

// ====== NAVIGATION BETWEEN STEPS =======
// all the messages that shows up between steps
function gotocartstep() {
    if (cart.length === 0) {
        showglobalmessage(
            "Your cart is empty. You can review step2, but there are no items yet.",
            "alert-warning"
        );
    } else {
        rendercarttable();
    }
    showstep(2);
}

function gotocheckoutstep() {
    if (cart.length === 0) {
        showglobalmessage(
            "You have no items added to your cart. Please add at least 1 product before you continue.",
            "alert-warning"
        );
        return;
    }
    showstep(3);
}

function resetprocess() {
    cart = [];
    clearbuyerform();
    updatecartui();
    showglobalmessage("The process has been reset. You can start a new donation.", "alert-info");
    showstep(1);
}

// ========= FORM VALIDATION AND CHECKOUT ==========


//this functions flows when the user submit step 3, its stop the form for reloading, checks all inputs, fills the final summary and moves to setp4
function handlecheckout(event) {
    event.preventDefault();

    var isvalid = validatecheckoutform();

    if (isvalid) {
        fillsummary();
        showglobalmessage(
            "Your data was accepted. Please review the confirmation.",
            "alert-success"
        );
        showstep(4);
    }
}

//to check every field in the form
function validatecheckoutform() {
    var nameinput = document.getElementById("buyername");
    var emailinput = document.getElementById("buyeremail");
    var addressinput = document.getElementById("buyeraddress");
    var zipinput = document.getElementById("buyerzip");
    var cityinput = document.getElementById("buyercity");
    var countryinput = document.getElementById("buyercountry");
    var phoneinput = document.getElementById("buyerphone");
    var formalert = document.getElementById("formmessagebox");

    clearinvalid(nameinput);
    clearinvalid(emailinput);
    clearinvalid(addressinput);
    clearinvalid(zipinput);
    clearinvalid(cityinput);
    clearinvalid(countryinput);
    clearinvalid(phoneinput);
    
    if (formalert) {
        formalert.classList.add("d-none");
    }

    var isvalid = true;

    var namevalue = nameinput.value.trim();
    if (namevalue.length < 2) {
        setinvalid(nameinput, "Full name must be at least 2 characters.");
        isvalid = false;
    }

    var emailvalue = emailinput.value.trim();
    if (emailvalue.indexOf("@") === -1 || emailvalue.indexOf(".") === -1) {
        setinvalid(emailinput, "Please enter a valid email address.");
        isvalid = false;
    }

    var addressvalue = addressinput.value.trim();
    if (addressvalue.length < 2) {
        setinvalid(addressinput, "Address must be at least 2 characters.");
        isvalid = false;
    }

    var zipvalue = zipinput.value.trim();
    if (zipvalue.length === 0 || zipvalue.length > 6) {
        setinvalid(zipinput, "ZIP code is required (max 6 characters).");
        isvalid = false;
    }

    var cityvalue = cityinput.value.trim();
    if (cityvalue.length < 2) {
        setinvalid(cityinput, "City must be at least 2 characters.");
        isvalid = false;
    }

    var countryvalue = countryinput.value.trim();
    if (countryvalue.length < 2) {
        setinvalid(countryinput, "Country must be at least 2 characters.");
        isvalid = false;
    }

    var phonevalue = phoneinput.value.trim();
    if (phonevalue.length === 0) {
        setinvalid(phoneinput, "Phone number is required (digits only).");
        isvalid = false;
    } else {
        var digitonlypattern = /^[0-9]+$/;
        if (!digitonlypattern.test(phonevalue)) {
            setinvalid(phoneinput, "Phone number must contain digits only.");
            isvalid = false;
        }
    }

    if (!isvalid && formalert) {
        formalert.innerText = "Please correct the highlighted fields before continuing.";
        formalert.classList.remove("d-none");
    }

    return isvalid;
}

//i used this one to add the bootstrap again then it finds what belongs tp the input and puts the error text inside it
function setinvalid(inputelement, errormessage) {
    inputelement.classList.add("is-invalid");
    var parent = inputelement.parentElement;
    if (parent) {
        var feedbackdiv = parent.querySelector(".invalid-feedback");
        if (feedbackdiv && errormessage) {
            feedbackdiv.innerText = errormessage;
        }
    }
}

//the opposite
function clearinvalid(inputelement) {
    inputelement.classList.remove("is-invalid");
    var parent = inputelement.parentElement;
    if (parent) {
        var feedbackdiv = parent.querySelector(".invalid-feedback");
        if (feedbackdiv) {
            feedbackdiv.innerText = "";
        }
    }
}

//this function resets all the fields so it basically it clears the invalid styles from every input then hides the alert box
function clearbuyerformvalidation() {
    clearinvalid(document.getElementById("buyername"));
    clearinvalid(document.getElementById("buyeremail"));
    clearinvalid(document.getElementById("buyeraddress"));
    clearinvalid(document.getElementById("buyerzip"));
    clearinvalid(document.getElementById("buyercity"));
    clearinvalid(document.getElementById("buyercountry"));
    clearinvalid(document.getElementById("buyerphone"));

    var formalert = document.getElementById("formmessagebox");
    if (formalert) {
        formalert.classList.add("d-none");
    }
}

//this function resets all form inputs to empty strings when user finishes step 4 and clicks to start a new donation
function clearbuyerform() {
    document.getElementById("buyername").value = "";
    document.getElementById("buyeremail").value = "";
    document.getElementById("buyeraddress").value = "";
    document.getElementById("buyerzip").value = "";
    document.getElementById("buyercity").value = "";
    document.getElementById("buyercountry").value = "";
    document.getElementById("buyerphone").value = "";

    clearbuyerformvalidation();
}

// ========== SUMMARY CREATION =========

function fillsummary() {
    var listelement = document.getElementById("summarylist");
    var i;

    if (!listelement) return;

    listelement.innerHTML = "";

    var totals = calculatetotals();

    for (i = 0; i < cart.length; i++) {
        var item = cart[i];
        var subtotal = item.price * item.quantity;

        var li = document.createElement("li");
        li.className = "list-group-item d-flex justify-content-between align-items-center";

        li.innerHTML = "<span>" + item.name + " × " + item.quantity +
            "</span><span>€" + subtotal.toFixed(2) + "</span>";

        listelement.appendChild(li);
    }

    document.getElementById("summarytotalgross").innerText = totals.total.toFixed(2);
    document.getElementById("summarytotaldiscount").innerText = totals.discount.toFixed(2);
    document.getElementById("summarytotalfinal").innerText = totals.final.toFixed(2);

    var namevalue = document.getElementById("buyername").value.trim();
    var emailvalue = document.getElementById("buyeremail").value.trim();
    var addressvalue = document.getElementById("buyeraddress").value.trim();
    var zipvalue = document.getElementById("buyerzip").value.trim();
    var cityvalue = document.getElementById("buyercity").value.trim();
    var countryvalue = document.getElementById("buyercountry").value.trim();
    var phonevalue = document.getElementById("buyerphone").value.trim();

    var buyertext = namevalue + "<br>" +
        addressvalue + "<br>" +
        zipvalue + " " + cityvalue + "<br>" +
        countryvalue + "<br>" +
        "Email: " + emailvalue + "<br>" +
        "Phone: " + phonevalue;

    document.getElementById("summarybuyer").innerHTML = buyertext;
}

// ======== GLOBAL ALERT ========

function showglobalmessage(message, alertclass) {
    var alertelement = document.getElementById("messagebox");
    if (!alertelement) return;

    alertelement.innerText = message;
    alertelement.className = "alert";
    alertelement.classList.add(alertclass);
    alertelement.classList.remove("d-none");
}

// ========== ON LOAD ========

window.onload = function () {
    showstep(1);
    updatecartui();
};
