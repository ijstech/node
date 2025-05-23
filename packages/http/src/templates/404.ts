/*!-----------------------------------------------------------
* Copyright (c) IJS Technologies. All rights reserved.
* Released under dual BSL 1.1/commercial license
* https://ijs.network
*-----------------------------------------------------------*/

export const page404 = `
<!DOCTYPE html>
<html>

    <head>
    	<link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.14.0/css/all.css" rel="stylesheet">
        <style>
            body {
                background-color: #313942;
                font-family: sans-serif;
                -webkit-box-align: center;
                align-items: center;
                display: -webkit-box;
                display: flex;
                -webkit-box-orient: vertical;
                -webkit-box-direction: normal;
                flex-direction: column;
                height: 100vh;
                -webkit-box-pack: center;
                justify-content: center;
                text-align: center;
            }
            h1 {
                color: #e7ebf2;
                font-size: 12.5rem;
                letter-spacing: .10em;
                margin: .025em 0;
                text-shadow: 0.05em 0.05em 0 rgba(0, 0, 0, 0.25);
                white-space: nowrap;
            }
            @media (max-width: 30rem) {
                h1 {
                    font-size: 8.5rem;
                }
            }
            h1 > span {
                -webkit-animation: spooky 2s alternate infinite linear;
                animation: spooky 2s alternate infinite linear;
                color: #528cce;
                display: inline-block;
            }
            h2 {
                color: #e7ebf2;
                margin-bottom: .40em;
            }
            p {
                color: #ccc;
                margin-top: 0;
            }
            @-webkit-keyframes spooky {
                from {
                    -webkit-transform: translatey(0.15em) scaley(0.95);
                    transform: translatey(0.15em) scaley(0.95);
                }
                to {
                    -webkit-transform: translatey(-0.15em);
                    transform: translatey(-0.15em);
                }
            }
            @keyframes spooky {
                from {
                    -webkit-transform: translatey(0.15em) scaley(0.95);
                    transform: translatey(0.15em) scaley(0.95);
                }
                to {
                    -webkit-transform: translatey(-0.15em);
                    transform: translatey(-0.15em);
                }
            }
        </style>
    </head>
    <body>
        <h1>4<span><i class="fas fa-ghost"></i></span>4</h1>
        <h2>Error: 404 page not found</h2>
        <p>Sorry, the page you're looking for cannot be found!</p>
    </body>
</html>
`;
export default {
    page404
}