<?php
declare(strict_types=1);

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Location: contact-us.html');
    exit;
}

function sanitize_header(string $value): string
{
    return str_replace(["\r", "\n"], '', trim($value));
}

$name = sanitize_header($_POST['name'] ?? '');
$email = sanitize_header($_POST['email'] ?? '');
$subject = sanitize_header($_POST['subject'] ?? '');
$phone = sanitize_header($_POST['phone'] ?? '');
$message = trim($_POST['message'] ?? '');

if ($name === '' || $email === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    header('Location: contact-us.html?status=invalid');
    exit;
}

$to = 'dmott@myrestorePT.com';
$mailSubject = $subject !== ''
    ? '[Contact Form] ' . $subject
    : '[Contact Form] New message from ' . $name;

$bodyLines = [
    'Name: ' . $name,
    'Email: ' . $email,
];

if ($phone !== '') {
    $bodyLines[] = 'Phone: ' . $phone;
}

$bodyLines[] = '';
$bodyLines[] = 'Message:';
$bodyLines[] = $message;

$body = implode("\n", $bodyLines);

$headers = [
    'From: Restore PT Contact Form <noreply@myrestorept.com>',
    'Reply-To: ' . $email,
    'Content-Type: text/plain; charset=UTF-8',
];

$sent = mail($to, $mailSubject, $body, implode("\r\n", $headers));

header('Location: contact-us.html?status=' . ($sent ? 'sent' : 'error'));
exit;
