const bloodBridgeTemplate = ({ bloodGroup, city, requestId, frontendUrl }) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Blood Request</title>
    <style>
        /* Reset styles for email clients */
        body, p, h1, h2, h3, div, span, table, tr, td {
            margin: 0;
            padding: 0;
            border: 0;
            font-size: 100%;
            font: inherit;
            vertical-align: baseline;
        }

        /* Base styles */
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333333;
            background-color: #f5f5f5;
            margin: 0;
            padding: 0;
        }

        /* Container */
        .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #ffffff;
        }

        /* Header */
        .header {
            text-align: center;
            padding: 20px 0;
            background-color: #dc3545;
            color: white;
            border-radius: 8px 8px 0 0;
        }

        .header h1 {
            font-size: 24px;
            font-weight: bold;
            margin: 0;
        }

        /* Content */
        .content {
            padding: 30px 20px;
            background-color: #ffffff;
            border-radius: 0 0 8px 8px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .urgent-badge {
            display: inline-block;
            background-color: #dc3545;
            color: white;
            padding: 5px 10px;
            border-radius: 4px;
            font-size: 14px;
            margin-bottom: 15px;
        }

        .blood-info {
            background-color: #f8d7da;
            border: 1px solid #f5c6cb;
            border-radius: 4px;
            padding: 15px;
            margin: 20px 0;
            text-align: center;
        }

        .blood-group {
            font-size: 24px;
            font-weight: bold;
            color: #dc3545;
        }

        .location {
            font-size: 18px;
            color: #666;
            margin-top: 5px;
        }

        /* Button */
        .button-container {
            text-align: center;
            margin: 25px 0;
        }

        .button {
            display: inline-block;
            background-color: #dc3545;
            color: white;
            padding: 12px 25px;
            text-decoration: none;
            border-radius: 5px;
            font-weight: bold;
            text-align: center;
        }

        /* Footer */
        .footer {
            text-align: center;
            padding: 20px;
            color: #666666;
            font-size: 14px;
        }

        /* Responsive styles */
        @media only screen and (max-width: 600px) {
            .container {
                width: 100% !important;
                padding: 10px !important;
            }

            .content {
                padding: 20px 15px !important;
            }

            .header h1 {
                font-size: 20px !important;
            }

            .blood-group {
                font-size: 20px !important;
            }

            .location {
                font-size: 16px !important;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🩸 BloodBridge</h1>
        </div>
        <div class="content">
            <span class="urgent-badge">URGENT REQUEST</span>
            
            <div class="blood-info">
                <div class="blood-group">Blood Group ${bloodGroup}</div>
                <div class="location">Required in ${city}</div>
            </div>

            <p>We have received an urgent blood request in your area. Your blood donation could save a life today.</p>
            
            <div class="button-container">
                <a href="${frontendUrl}/bloodbridge/request/${requestId}" class="button">
                    View Request Details
                </a>
            </div>

            <p>If you are available to donate, please check the request details on our platform and respond as soon as possible.</p>
        </div>
        
        <div class="footer">
            <p>Thank you for being a part of BloodBridge!</p>
            <p style="margin-top: 10px; font-size: 12px;">
                This is an automated message. Please do not reply to this email.
            </p>
        </div>
    </div>
</body>
</html>
`;

export default bloodBridgeTemplate;