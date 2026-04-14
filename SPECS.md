# Specs

All screenshots output to `output/` and are gitignored.

## Web — Password Manager (`output/web/passwordmanager/`)

| Spec | Output | Notes |
|---|---|---|
| `screenshots/web/passwordmanager/vault.spec.js` | `vault.png` | Base vault page. |
| | `vault-new-login.png` | New Login dialog. |
| | `vault-new-card.png` | New Card dialog. |
| | `vault-new-identity.png` | New Identity dialog. |
| | `vault-new-note.png` | New Note dialog. |
| | `vault-new-ssh-key.png` | New SSH key dialog. |
| | `vault-new-folder.png` | New Folder dialog. |
| | `vault-new-collection.png` | New Collection dialog. |
| | `vault-item-options-login.png` | Login item options menu. |
| | `vault-bulk-options.png` | Bulk actions menu (2 items selected). |
| `screenshots/web/passwordmanager/send.spec.js` | `send.png` | Base Send page. |
| | `send-new-text.png` | New Text Send dialog. |
| | `send-new-file.png` | New File Send dialog. |
| `screenshots/web/passwordmanager/tools-generator.spec.js` | `tools-generator-password.png` | Password view (default). |
| | `tools-generator-passphrase.png` | Passphrase view. |
| | `tools-generator-username.png` | Username view. |
| `screenshots/web/passwordmanager/tools-import.spec.js` | `tools-import.png` | |
| `screenshots/web/passwordmanager/tools-export.spec.js` | `tools-export.png` | |

## Web — Admin Console (`output/web/adminconsole/`)

| Spec | Output | Notes |
|---|---|---|
| `screenshots/web/adminconsole/access-intelligence.spec.js` | `access-intelligence-activity.png` | Requires `ORG_ID`. Masks account avatar. |
| | `access-intelligence-all.png` | All applications tab. |
| | `access-intelligence-critical.png` | Critical applications tab. |
| `screenshots/web/adminconsole/policies.spec.js` | `policies.png` | Requires `ORG_ID`. Full page. |
| `screenshots/web/adminconsole/org-vault.spec.js` | `org-vault.png` | Requires `ORG_ID`. Full page. |
| `screenshots/web/adminconsole/members.spec.js` | `members.png` | Requires `ORG_ID`. Full page. |
| `screenshots/web/adminconsole/groups.spec.js` | `groups.png` | Requires `ORG_ID`. Full page. |
| `screenshots/web/adminconsole/org-settings-account.spec.js` | `org-settings-account.png` | Requires `ORG_ID`. Full page. |
| `screenshots/web/adminconsole/org-settings-two-factor.spec.js` | `org-settings-two-factor.png` | Requires `ORG_ID`. Full page. |
| `screenshots/web/adminconsole/org-settings-import.spec.js` | `org-settings-import.png` | Requires `ORG_ID`. Full page. |
| `screenshots/web/adminconsole/org-settings-export.spec.js` | `org-settings-export.png` | Requires `ORG_ID`. Full page. |
| `screenshots/web/adminconsole/org-settings-domain-verification.spec.js` | `org-settings-domain-verification.png` | Requires `ORG_ID`. Full page. |
| `screenshots/web/adminconsole/org-settings-sso.spec.js` | `org-settings-sso.png` | Requires `ORG_ID`. Full page. |
| `screenshots/web/adminconsole/org-settings-scim.spec.js` | `org-settings-scim.png` | Requires `ORG_ID`. Full page. |
| `screenshots/web/adminconsole/integrations.spec.js` | `integrations-sso.png` | Requires `ORG_ID`. |
| | `integrations-user-provisioning.png` | User provisioning tab. |
| | `integrations-event-management.png` | Event management tab. |
| | `integrations-device-management.png` | Device management tab. |
| `screenshots/web/adminconsole/billing-subscription.spec.js` | `billing-subscription.png` | Requires `ORG_ID`. Full page. |
| `screenshots/web/adminconsole/billing-payment-details.spec.js` | `billing-payment-details.png` | Requires `ORG_ID`. Full page. |
| `screenshots/web/adminconsole/billing-history.spec.js` | `billing-history.png` | Requires `ORG_ID`. Full page. |
| `screenshots/web/adminconsole/reporting-reports-home.spec.js` | `reporting-reports-home.png` | Requires `ORG_ID`. Full page. |
| `screenshots/web/adminconsole/reporting-reports.spec.js` | `reporting-exposed-passwords.png` | Requires `ORG_ID`. |
| | `reporting-inactive-two-factor.png` | |
| | `reporting-reused-passwords.png` | |
| | `reporting-unsecured-websites.png` | |
| | `reporting-weak-passwords.png` | |
| `screenshots/web/adminconsole/reporting-member-access.spec.js` | `reporting-member-access.png` | Requires `ORG_ID`. Full page. |
| `screenshots/web/adminconsole/reporting-events.spec.js` | `reporting-events.png` | Requires `ORG_ID`. Full page. |
