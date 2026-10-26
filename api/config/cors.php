<?php

return [
  'paths' => ['api/*', 'sanctum/csrf-cookie', 'store'], // добавьте 'store', если роут не в api.php

  'allowed_methods' => ['*'],

  'allowed_origins' => [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
  ],

  'allowed_headers' => ['*'],

  'supports_credentials' => true, // обязательно, т.к. вы шлёте credentials: "same-origin" и CSRF
];
