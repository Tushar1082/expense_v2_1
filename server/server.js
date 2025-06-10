require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');
const {
  client,
  userColl,
  groupExpColl,
  savingGoalsColl
} = require('./database/mongodb_db.js');
const { sign } = require('jsonwebtoken');
// const Stripe = require('stripe');
// const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
const PORT = process.env.PORT;
const helmet = require('helmet');
const Razorpay = require("razorpay");
const crypto = require("crypto");

// Middlewares
const verifyToken = require('./middleware/auth');

// Routes
const user_routes = require('./routes/user-routes.js');
const track_my_expenses_routes = require('./routes/track-my-expenses-routes.js');
const search_friends_routes = require('./routes/search-friends.js');
const travel_expenses_routes = require('./routes/travel-expenses.js');
const group_routes = require('./routes/group.js');
// const group_expenses_routes = require('./routes/group-expenses.js');
// const recurring_expenses_routes = require('./routes/recurring-expenses.js');
const saving_goals_routes = require('./routes/saving-goals.js');
const friend_request_routes = require('./routes/friend-request.js');
const notifications_routes = require('./routes/notifications.js');
const email_routes = require('./routes/email.js');
/*
 GET: Retrieve information.
 POST: Create a new resource.
 PUT: Updating an existing resource( complete update) or use for replace data
 PATCH: Update a specific field of a resource (partial update)
 DELETE: Remove a resource.
*/

const { send_mail_get, send_mail_post, send_mail_put } = require('./apiControllers/forgotPassword.js');
const { login_get } = require('./apiControllers/login.js');
const { ObjectId } = require('mongodb');
// const { send_mail_registration } = require('./apiControllers/email.js');
// const {user_get, user_post, user_put, user_patch} = require('./apiControllers/user.js');

app.use(express.json()); //for parsing JSON
app.use(express.urlencoded({ extended: true })); // for URL-encoded data
app.use(cors({ origin: ['http://localhost:5173', 'https://spendingsmart.onrender.com', 'https://spendingsmart-bf0e0.web.app'] }));
app.use(helmet());

// Routes
app.use('/user', verifyToken, user_routes);
app.use('/track-my-expenses', verifyToken, track_my_expenses_routes);
app.use('/search-friends', search_friends_routes);
app.use('/travel_expenses', travel_expenses_routes);
app.use('/group', verifyToken, group_routes);
// app.use('/group-expenses',group_expenses_routes);
// app.use('/recurring_expenses', recurring_expenses_routes);
app.use('/saving-goals', verifyToken, saving_goals_routes);
app.use('/friend-request', verifyToken, friend_request_routes);
app.use('/notification', verifyToken, notifications_routes);
app.use('/email', verifyToken, email_routes);

app.get('/', (req, res) => {
  res.send('');
});
//forgetPassword
app.get('/forgotpassword', send_mail_get);
app.post("/forgotpassword", send_mail_post);
app.put("/forgotpassword", send_mail_put);

//Sign-in
app.get('/login', login_get);
app.get('/login/email', async (req, res) => {
  try {
    const { email } = req.query;
    const SECRET_KEY = process.env.JWT_SECRET;

    if (!email) {
      return res.status(400).json({ failed: true, message: "Missing field: email" });
    }

    const result = await userColl.findOne({ email: email }, { projection: { _id: 1 } });
    if (!result) {
      return res.status(400).json({ isExists: false, message: "You are not signed up, Please Signup First!" });
    }

    const res_token = sign({ user_id: result._id }, SECRET_KEY);

    if (result) {
      return res.status(200).json({ isExists: true, token: res_token });
    }
  } catch (error) {
    return res.status(500).json({ failed: true, message: error.message });
  }
});

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_API_KEY,
  key_secret: process.env.RAZORPAY_API_SECRET,
});

app.post('/payment/create-order', verifyToken, async (req, res) => {
  const { amount, expense_id, moneyRequest_id } = req.body;
  const user_id = req.user.user_id;

  if (!amount) {
    return res.status(400).json({ failed: true, message: "Missing Field: amount" });
  } else if (!expense_id) {
    return res.status(400).json({ failed: true, message: "Missing Field: expense_id" });
  } else if (!user_id) {
    return res.status(400).json({ failed: true, message: "Missing Field: user_id" });
  }

  try {
    // Before creating order, first check money request still exists or not.
    const result = await userColl.findOne({_id: new ObjectId(user_id)},{projection:{money_request:1,_id:0}});
    // console.log(result);
    if(!result){
      return res.status(400).json({failed: true, message:"user money request data is not found..."});
    }
    const isExists = result.money_request.some((elm)=>elm.moneyRequest_id.toString() === moneyRequest_id );

    if(!isExists){
      return res.status(400).json({notExists:true});
    }
    const pay_amount = Number(amount.toFixed(2)); // ensures it's a number with 2 decimal places
    const amountInPaise = Math.round(pay_amount * 100); // now it's a proper integer in paise

    const order = await razorpay.orders.create({
      amount: amountInPaise, // safe integer
      currency: "INR",
      receipt: `${expense_id.slice(-6)}_${user_id.slice(-6)}`
    });

    return res.status(200).json({ order });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ failed: true, error });
  }
});

app.post("/payment/verify", verifyToken, async (req, res) => {
  const session = client.startSession();
  let transactionStarted = false;

  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      moneyRequest_id,
      from,
      receiver_id,
      receiver_name,
      receiver_profile_image,
      expense_id,
      expense_name,
      expense_amount,
      total_expense_amount,
      user_profile_img,
      user_name,
      group_id,
      group_name
    } = req.body;
    const user_id = req.user.user_id;

    // Validate required fields
    if (!user_id) {
      return res.json({ success: false, message: 'Missing Field: user_id' });
    }

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      // Save transaction as "Fail" when payment details are missing
      const transaction_id = new ObjectId();
      await userColl.updateOne(
        { _id: new ObjectId(user_id) },
        {
          $push: {
            transactions: {
              transaction_id,
              payment_id: razorpay_payment_id || "N/A",
              order_id: razorpay_order_id || "N/A",
              expense_id: expense_id ? new ObjectId(expense_id) : null,
              expense_name: expense_name || "N/A",
              expense_amount: parseFloat(expense_amount) || 0,
              total_expense_amount: parseFloat(total_expense_amount) || 0,
              payment_date: new Date(),
              payment_status: "Fail",
              failure_reason: "Missing payment details",
              payer: {
                payer_id: new ObjectId(user_id),
                payer_profile_image: user_profile_img || "",
                payer_name: user_name || "Unknown"
              },
              receiver: {
                receiver_id: receiver_id ? new ObjectId(receiver_id) : null,
                receiver_profile_image: receiver_profile_image || "",
                receiver_name: receiver_name || "Unknown"
              },
              transactionType: "debit",
              source: from || "Unknown",
              group_id: group_id ? new ObjectId(group_id) : null,
              group_name: group_name || '',
              money_request_id: moneyRequest_id ? new ObjectId(moneyRequest_id) : null
            }
          }
        }
      );
      return res.status(400).json({
        success: false,
        transaction_id: transaction_id.toString(),
        message: "Invalid payment details"
      });
    }

    // Validate additional required fields for successful payment processing
    if (!moneyRequest_id || !expense_id || !expense_amount || !receiver_id) {
      const transaction_id = new ObjectId();
      await userColl.updateOne(
        { _id: new ObjectId(user_id) },
        {
          $push: {
            transactions: {
              transaction_id,
              payment_id: razorpay_payment_id,
              order_id: razorpay_order_id,
              expense_id: expense_id ? new ObjectId(expense_id) : null,
              expense_name: expense_name || "N/A",
              expense_amount: parseFloat(expense_amount) || 0,
              total_expense_amount: parseFloat(total_expense_amount) || 0,
              payment_date: new Date(),
              payment_status: "Fail",
              failure_reason: "Missing required fields",
              payer: {
                payer_id: new ObjectId(user_id),
                payer_profile_image: user_profile_img || "",
                payer_name: user_name || "Unknown"
              },
              receiver: {
                receiver_id: receiver_id ? new ObjectId(receiver_id) : null,
                receiver_profile_image: receiver_profile_image || "",
                receiver_name: receiver_name || "Unknown"
              },
              transactionType: "debit",
              source: from || "Unknown",
              group_id: group_id ? new ObjectId(group_id) : null,
              group_name: group_name || '',
              money_request_id: moneyRequest_id ? new ObjectId(moneyRequest_id) : null
            }
          }
        }
      );
      return res.status(400).json({
        success: false,
        transaction_id: transaction_id.toString(),
        message: "Missing required fields: moneyRequest_id, expense_id, expense_amount, or receiver_id"
      });
    }

    // Generate Razorpay signature for verification
    const generated_signature = crypto
      .createHmac("sha256", process.env.RAZORPAY_API_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    const isPaymentValid = generated_signature === razorpay_signature;
    const transaction_id = new ObjectId();

    // Start transaction
    await session.startTransaction();
    transactionStarted = true;

    // Always save transaction record first (for payer)
    const transactionResult = await userColl.updateOne(
      { _id: new ObjectId(user_id) },
      {
        $push: {
          transactions: {
            transaction_id,
            payment_id: razorpay_payment_id,
            order_id: razorpay_order_id,
            signature: razorpay_signature,
            expense_id: new ObjectId(expense_id),
            expense_name,
            expense_amount: parseFloat(expense_amount),
            total_expense_amount: parseFloat(total_expense_amount) || 0,
            payment_date: new Date(),
            payment_status: isPaymentValid ? "Success" : "Fail",
            failure_reason: isPaymentValid ? null : "Invalid payment signature",
            payer: {
              payer_id: new ObjectId(user_id),
              payer_profile_image: user_profile_img || "",
              payer_name: user_name || "Unknown"
            },
            receiver: {
              receiver_id: receiver_id ? new ObjectId(receiver_id) : null,
              receiver_profile_image: receiver_profile_image || "",
              receiver_name: receiver_name || "Unknown"
            },
            transactionType: "debit",
            source: from || "Unknown",
            group_id: group_id ? new ObjectId(group_id) : null,
            group_name: group_name || '',
            money_request_id: new ObjectId(moneyRequest_id)
          }
        }
      },
      { session }
    );

    if (!isPaymentValid) {
      // Signature mismatch: commit failed transaction record and return
      await session.commitTransaction();
      return res.status(400).json({
        success: false,
        transaction_id: transaction_id.toString(),
        message: "Invalid payment signature"
      });
    }

    // Payment is valid - proceed with business logic
    const result1 = await userColl.updateOne(
      { _id: new ObjectId(user_id) },
      { $pull: { money_request: { moneyRequest_id: new ObjectId(moneyRequest_id) } } },
      { session }
    );

    let result2 = { modifiedCount: 1 }; // Default for non-group expenses

    if (from === "Group Expenses") {
      result2 = await groupExpColl.updateOne(
        {
          group_id: new ObjectId(group_id),
          "expenses.expense_id": new ObjectId(expense_id)
        },
        {
          $set: {
            "expenses.$[expense].splitDetails.$[user].paymentStatus": "Paid",
            "expenses.$[expense].splitDetails.$[user].paidAt": new Date(),
            "expenses.$[expense].splitDetails.$[user].transactionId": transaction_id
          }
        },
        {
          arrayFilters: [
            { "expense.expense_id": new ObjectId(expense_id) },
            { "user.user_id": new ObjectId(user_id) }
          ],
          session
        }
      );
    }

    // Add transaction to payment receiver
    const result3 = await userColl.updateOne(
      { _id: new ObjectId(receiver_id) },
      {
        $push: {
          transactions: {
            transaction_id,
            payment_id: razorpay_payment_id,
            order_id: razorpay_order_id,
            signature: razorpay_signature,
            expense_id: new ObjectId(expense_id),
            expense_name,
            expense_amount: parseFloat(expense_amount),
            total_expense_amount: parseFloat(total_expense_amount) || 0,
            payment_date: new Date(),
            payment_status: "Success", // Always success for receiver since payment is valid
            failure_reason: null,
            payer: {
              payer_id: new ObjectId(user_id),
              payer_profile_image: user_profile_img || "",
              payer_name: user_name || "Unknown"
            },
            receiver: {
              receiver_id: receiver_id ? new ObjectId(receiver_id) : null,
              receiver_profile_image: receiver_profile_image || "",
              receiver_name: receiver_name || "Unknown"
            },
            transactionType: "credit",
            source: from || "Unknown",
            group_id: group_id ? new ObjectId(group_id) : null,
            group_name: group_name || '',
            money_request_id: new ObjectId(moneyRequest_id)
          }
        }
      },
      { session }
    );

    const result4 = await userColl.updateOne(
      { _id: new ObjectId(receiver_id) },
      {
        $push:
        {
          notifications: {
            notification_id: new ObjectId(),
            type: "money-request",
            status: "unread",
            user_id: new ObjectId(user_id),
            user_profile_image: user_profile_img,
            message: `John paid ₹${parseFloat(expense_amount)} for '${expense_name}' expense of ${group_name}(${from})`,
            date: new Date()
          }
        }
      }, { session }
    );

    // Check if updates were successful
    if (result1.modifiedCount === 0) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        transaction_id: transaction_id.toString(),
        message: "Money request not found or already processed"
      });
    }

    if (from === "Group Expenses" && result2.modifiedCount === 0) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        transaction_id: transaction_id.toString(),
        message: "Failed to update expense payment status"
      });
    }

    if (result3.matchedCount === 0) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        transaction_id: transaction_id.toString(),
        message: "Receiver not found - failed to record transaction"
      });
    }

    // Commit the main transaction
    await session.commitTransaction();
    transactionStarted = false; // Transaction completed

    // Check if expense is fully paid (outside transaction for better performance)
    if (from === "Group Expenses") {
      try {
        const expenseDoc = await groupExpColl.findOne(
          { group_id: new ObjectId(group_id), "expenses.expense_id": new ObjectId(expense_id) },
          { projection: { "expenses.$": 1 } }
        );

        const expense = expenseDoc?.expenses?.[0];
        if (expense) {
          const allPaid = expense.splitDetails.every((elem) => elem.paymentStatus === "Paid");

          if (allPaid) {
            // Update settlement status (separate operation, not critical for payment success)
            await groupExpColl.updateOne(
              {
                group_id: new ObjectId(group_id),
                "expenses.expense_id": new ObjectId(expense_id)
              },
              {
                $set: {
                  "expenses.$.isSettled": {
                    confirm: true,
                    paymentMode: "Online",
                    settledAt: new Date()
                  }
                }
              }
            );
          }
        }
      } catch (settlementError) {
        // Log settlement error but don't fail the payment
        console.error("Settlement status update failed:", settlementError);
      }
    }

    return res.status(200).json({
      success: true,
      transaction_id: transaction_id.toString(),
      message: "Payment verified successfully"
    });

  } catch (error) {
    if (transactionStarted) {
      try {
        await session.abortTransaction();
      } catch (abortError) {
        console.error("Transaction abort failed:", abortError);
      }
    }
    console.error("Payment verification error:", error);
    return res.status(500).json({
      success: false,
      message: "Payment verification failed due to server error"
    });
  } finally {
    try {
      await session.endSession();
    } catch (endError) {
      console.error("Session end failed:", endError);
    }
  }
});

app.get('/dashboard', verifyToken, async(req, res)=>{
  try {    
    const user_id = req.user.user_id;
    
    if(!user_id){
      return res.status(400).json({failed:true, message:"Missing Field: user_id"});
    }
    //   1. All expense profile total and current
    
    // 2. five saving goals
    const result2 = await savingGoalsColl.find({user_id: new ObjectId(user_id)}).limit(5).toArray();

    // 3. recent 5 transactions
    // const result3 = await
    return res.status(200).json({data:{saving_goals:result2, exp_prof_aggr_data:[]}});
  } catch (error) {
      return res.status(500).json({failed:true, message:error.message});
  }
});
// app.listen(PORT,'192.168.1.3',()=>{
//     console.log('Server is running...');
// });

// app.get('/email', async (req, res)=>{

//   if(result){
// await send_mail("Tushar", "tusharsharma1082@gmail.com", "Pass@123",true);  
//     res.json({send:true});
//   }else
//     res.json({send:false});

// });
app.listen(PORT, () => {
  console.log('Server is running...');
});

