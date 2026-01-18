<?php
// Initialize variables
$name = $email = "";
$errors = [];

// When form is submitted
if ($_SERVER["REQUEST_METHOD"] == "POST") {

    // Name validation
    if (empty($_POST["name"])) {
        $errors[] = "Name is required";
    } else {
        $name = htmlspecialchars(trim($_POST["name"]));
    }

    // Email validation
    if (empty($_POST["email"])) {
        $errors[] = "Email is required";
    } else if (!filter_var($_POST["email"], FILTER_VALIDATE_EMAIL)) {
        $errors[] = "Invalid email format";
    } else {
        $email = htmlspecialchars(trim($_POST["email"]));
    }

    // Password validation
    if (empty($_POST["password"]) || empty($_POST["confirm_password"])) {
        $errors[] = "Both password fields are required";
    } else if ($_POST["password"] !== $_POST["confirm_password"]) {
        $errors[] = "Passwords do not match";
    }

    // If no errors → success message
    if (count($errors) == 0) {
        $success = true;
    }
}
?>

<!DOCTYPE html>
<html>
<head>
    <title>User Registration</title>

    <style>
        body {
            font-family: Arial;
            background: #f3f3f3;
            padding: 20px;
        }
        .container {
            width: 350px;
            background: #fff;
            padding: 20px;
            margin: auto;
            border-radius: 8px;
            box-shadow: 0 0 10px #ccc;
        }
        input {
            width: 100%;
            padding: 8px;
            margin: 7px 0;
            border: 1px solid #aaa;
            border-radius: 5px;
        }
        .error {
            background: #ffdddd;
            padding: 10px;
            color: red;
            margin-bottom: 10px;
        }
        .success {
            background: #ddffdd;
            padding: 10px;
            color: green;
            margin-bottom: 10px;
        }
        button {
            background: blue;
            color: white;
            padding: 10px;
            width: 100%;
            border: none;
            border-radius: 5px;
        }
    </style>

</head>
<body>

<div class="container">
    <h2>User Registration</h2>

    <?php
    // Show errors
    if (!empty($errors)) {
        echo "<div class='error'>";
        foreach ($errors as $e) {
            echo "$e<br>";
        }
        echo "</div>";
    }

    // Success message
    if (!empty($success)) {
        echo "<div class='success'>Registration successful!</div>";
        echo "<b>Your Entered Data:</b><br>";
        echo "Name: $name<br>";
        echo "Email: $email<br>";
    }
    ?>

    <form method="POST" action="">

        <input type="text" name="name" placeholder="Enter Name" value="<?php echo $name; ?>">

        <input type="text" name="email" placeholder="Enter Email" value="<?php echo $email; ?>">

        <input type="password" name="password" placeholder="Enter Password">

        <input type="password" name="confirm_password" placeholder="Confirm Password">

        <button type="submit">Register</button>

    </form>
</div>

</body>
</html>
