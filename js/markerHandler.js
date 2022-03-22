// User number
var userNumber = null;

AFRAME.registerComponent("marker-handler",{
    init:async function(){

        if(userNumber === null){
            this.askUserNumber();
        }


        //Get the toys collection
        var toys = await this.getToys();
        console.log(toys)

        this.el.addEventListener("markerFound",()=>{
            console.log("Marker Found!");
            if (userNumber !== null) {
                var markerId = this.el.id;
                this.markerFound(toys, markerId);
              }
        });
        this.el.addEventListener("markerLost",()=>{
            console.log("Marker Lost!");
            this.markerLost();
        });    
    },  
    markerFound:function(toys,markerId){
        // Get the toy based on ID
        var toy = toys.filter(toy => toy.id === markerId)[0];

        var button = document.getElementById("button1");
        button.style.display = "flex" ;
        var summaryButton = document.getElementById("summary-button");
        var orderButton = document.getElementById("order-button");
        var payButton = document.getElementById("pay-button");

        
        summaryButton.addEventListener("click",()=>
        this.handleOrderSummary()
        );
        orderButton.addEventListener("click",()=>{
            var uNumber;
            userNumber <= 9 ? (uNumber = `U0${userNumber}`) : `T${userNumber}`;
            this.handleOrder(uNumber, toy);
  
            swal({
                icon : "https://cdn-icons-png.flaticon.com/512/686/686370.png",
                tite : "Thankyou For Ordering!",
                text : "Your Toy Will Be Delivered Soon",
                timer: 2000,
                buttons: false
            });
        });
        payButton.addEventListener("click", () => this.handlePayment());
    },
    markerLost:function(){
        var button = document.getElementById("button1");
        button.style.display = "none" ;

    },
    handleOrder :function(uid, toy){
        firebase 
        .firestore()
        .collection("users")
        .doc(uid)
        .get()
        .then(doc=>{
            var details = doc.data();

            if(details["current_orders"][toy.id]){
                details["current_orders"][toy.id]["quantity"] += 1;

                var currentQuantity = details["current_orders"][toy.id]["quantity"];

                details["current_orders"][toy.id]["subtotal"] = 
                    currentQuantity * toy.price;
            }
            else{
                details["current_orders"][toy.id] = {
                    item : toy.toyName,
                    price:toy.price,
                    quantity:1,
                    subtotal:toy.price*1
                };

            };
            details.total_bill += toy.price;

            // Updating DB
            firebase
                .firestore()
                .collection("users")
                .doc(doc.id)
                .update(details);
        });
    },
    // Function to get toys collection from db
    getDishes: async function () {
        return await firebase
          .firestore()
          .collection("toys")
          .get()
          .then(snap => {
            return snap.docs.map(doc => doc.data());
          });
      },
    //  Ask the user for the number
      askUserNumber: function () {
        var iconUrl = "https://cdn-icons.flaticon.com/png/512/551/premium/551239.png?token=exp=1647527419~hmac=210f9a1a086408bf483f0ae9cf865472";
        swal({
          title: "Welcome to ToysForU!!",
          icon: iconUrl,
          content: {
            element: "input",
            attributes: {
              placeholder: "Type in your user number",
              type: "number",
              min: 1
            }
          },
          closeOnClickOutside: false,
        }).then(inputValue => {
          userNumber = inputValue;
        });
      },

      getToys: async function(){
        return await firebase
        .firestore()
        .collection("toys")
        .get()
        .then(snap=>{
            return snap.docs.map(doc => doc.data());
        });
    },
    getOrderSummary : async function(uNumber){
        return await firebase.firestore().collection('users').doc(uNumber).get().then(doc => doc.data())
      },
    handleOrderSummary: async function () {
        // Changing modal div visibility
        var modalDiv = document.getElementById("modal-div");
        modalDiv.style.display = "flex";
    
        var userBodyTag = document.getElementById("bill-table-body");
    
        // Removing old tr data
        userBodyTag.innerHTML = "";
    
        // Getting user Number
        var uNumber;
        userNumber <= 9 ? (uNumber = `U0${userNumber}`) : `U${userNumber}`;
    
        // Getting Order Summary from database
        var orderSummary = await this.getOrderSummary(uNumber);
        console.log(orderSummary)
        var currentOrders = Object.keys(orderSummary.current_orders);
    
        currentOrders.map(i => {
          var tr = document.createElement("tr");
          var item = document.createElement("td");
          var price = document.createElement("td");
          var quantity = document.createElement("td");
          var subtotal = document.createElement("td");
    
          item.innerHTML = orderSummary.current_orders[i].item;
          price.innerHTML = "$" + orderSummary.current_orders[i].price;
          price.setAttribute("class", "text-center");
    
          quantity.innerHTML = orderSummary.current_orders[i].quantity;
          quantity.setAttribute("class", "text-center");
    
          subtotal.innerHTML = "$" + orderSummary.current_orders[i].subtotal;
          subtotal.setAttribute("class", "text-center");
    
          tr.appendChild(item);
          tr.appendChild(price);
          tr.appendChild(quantity);
          tr.appendChild(subtotal);
          userBodyTag.appendChild(tr);
        });
    
        var totalTr = document.createElement("tr");
    
        var td1 = document.createElement("td");
        td1.setAttribute("class", "no-line");
    
        var td2 = document.createElement("td");
        td1.setAttribute("class", "no-line");
    
        var td3 = document.createElement("td");
        td1.setAttribute("class", "no-line text-cente");
    
        var strongTag = document.createElement("strong");
        strongTag.innerHTML = "Total";
        td3.appendChild(strongTag);
    
        var td4 = document.createElement("td");
        td1.setAttribute("class", "no-line text-right");
        td4.innerHTML = "$" + orderSummary.total_bill;
    
        totalTr.appendChild(td1);
        totalTr.appendChild(td2);
        totalTr.appendChild(td3);
        totalTr.appendChild(td4);
    
        userBodyTag.appendChild(totalTr);
      },
      handlePayment: function () {
        // Close Modal
        document.getElementById("modal-div").style.display = "none";
    
        // Getting user Number
        var uNumber;
        userNumber <= 9 ? (uNumber = `U0${userNumber}`) : `U${userNumber}`;
    
        // Reseting current orders and total bill
        firebase
          .firestore()
          .collection("users")
          .doc(uNumber)
          .update({
            current_orders: {},
            total_bill: 0
          })
          .then(() => {
            swal({
              icon: "success",
              title: "Thanks For Paying !",
              text: "We Hope You Have Fun With Your Toy !!",
              timer: 2500,
              buttons: false
            });
          });
      },
});