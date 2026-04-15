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
| | `vault-view-login.png` | View/edit dialog for a Login item. |
| | `vault-view-card.png` | View/edit dialog for a Card item. |
| | `vault-view-identity.png` | View/edit dialog for an Identity item. |
| | `vault-view-note.png` | View/edit dialog for a Note item. |
| | `vault-view-ssh-key.png` | View/edit dialog for an SSH key item. |
| `screenshots/web/passwordmanager/send.spec.js` | `send.png` | Base Send page. |
| | `send-new-text.png` | New Text Send dialog. |
| | `send-new-file.png` | New File Send dialog. |
| `screenshots/web/passwordmanager/tools-generator.spec.js` | `tools-generator-password.png` | Password view (default). |
| | `tools-generator-passphrase.png` | Passphrase view. |
| | `tools-generator-username.png` | Username view. |
| `screenshots/web/passwordmanager/tools-import.spec.js` | `tools-import.png` | |
| `screenshots/web/passwordmanager/tools-export.spec.js` | `tools-export.png` | |
| `screenshots/web/passwordmanager/reports.spec.js` | `reports-home.png` | |
| | `reports-breach.png` | Base form state, no results. |
| | `reports-exposed-passwords.png` | Base state before check is run. |
| | `reports-reused-passwords.png` | |
| | `reports-unsecured-websites.png` | |
| | `reports-weak-passwords.png` | |
| | `reports-inactive-two-factor.png` | |
| `screenshots/web/passwordmanager/settings-subscription.spec.js` | `settings-subscription.png` | ⚠️ Requires premium account — spec currently commented out. |
| | `settings-payment-details.png` | ⚠️ Requires premium account. |
| | `settings-billing-history.png` | ⚠️ Requires premium account. |
| `screenshots/web/passwordmanager/settings-security.spec.js` | `settings-security-session-timeout.png` | |
| | `settings-security-password.png` | |
| | `settings-security-two-factor.png` | |
| | `settings-security-keys.png` | |
| | `settings-security-device-management.png` | |
| `screenshots/web/passwordmanager/settings-account-and-other.spec.js` | `settings-account.png` | |
| | `settings-appearance.png` | |
| | `settings-domain-rules.png` | |
| | `settings-emergency-access.png` | |
| | `settings-data-recovery.png` | |
| | `settings-sponsored-families.png` | |

## Web — Admin Console (`output/web/adminconsole/`)

| Spec | Output | Notes |
|---|---|---|
| `screenshots/web/adminconsole/access-intelligence.spec.js` | `access-intelligence-activity.png` | Requires `ORG_ID`. |
| | `access-intelligence-all.png` | All applications tab. |
| | `access-intelligence-critical.png` | Critical applications tab. |
| `screenshots/web/adminconsole/org-vault-members-groups.spec.js` | `org-vault.png` | Requires `ORG_ID`. |
| | `members.png` | |
| | `groups.png` | |
| `screenshots/web/adminconsole/integrations.spec.js` | `integrations-sso.png` | Requires `ORG_ID`. |
| | `integrations-user-provisioning.png` | |
| | `integrations-event-management.png` | |
| | `integrations-device-management.png` | |
| `screenshots/web/adminconsole/org-settings.spec.js` | `org-settings-account.png` | Requires `ORG_ID`. |
| | `org-settings-two-factor.png` | |
| | `org-settings-import.png` | |
| | `org-settings-export.png` | |
| | `org-settings-domain-verification.png` | |
| | `org-settings-sso.png` | |
| | `org-settings-scim.png` | |
| | `policies.png` | |
| `screenshots/web/adminconsole/billing.spec.js` | `billing-subscription.png` | Requires `ORG_ID`. |
| | `billing-payment-details.png` | |
| | `billing-history.png` | |
| `screenshots/web/adminconsole/reporting.spec.js` | `reporting-reports-home.png` | Requires `ORG_ID`. |
| | `reporting-exposed-passwords.png` | |
| | `reporting-inactive-two-factor.png` | |
| | `reporting-reused-passwords.png` | |
| | `reporting-unsecured-websites.png` | |
| | `reporting-weak-passwords.png` | |
| | `reporting-member-access.png` | |
| | `reporting-events.png` | |

## Web — Secrets Manager (`output/web/secretsmanager/`)

| Spec | Output | Notes |
|---|---|---|
| `screenshots/web/secretsmanager/sm-overview.spec.js` | `sm-overview.png` | Requires `SM_ORG_ID`. |
| `screenshots/web/secretsmanager/sm-projects.spec.js` | `sm-projects.png` | Requires `SM_ORG_ID`. At least one project must exist. |
| | `sm-project-detail-secrets.png` | Project detail > Secrets tab. |
| | `sm-project-detail-people.png` | Project detail > People tab. |
| | `sm-project-detail-machine-accounts.png` | Project detail > Machine accounts tab. |
| `screenshots/web/secretsmanager/sm-secrets.spec.js` | `sm-secrets.png` | Requires `SM_ORG_ID`. At least one secret must exist. |
| | `sm-secret-dialog-details.png` | Secret dialog > Name/Value pair tab. |
| | `sm-secret-dialog-people.png` | Secret dialog > People tab. |
| | `sm-secret-dialog-machine-accounts.png` | Secret dialog > Machine accounts tab. |
| `screenshots/web/secretsmanager/sm-machine-accounts.spec.js` | `sm-machine-accounts.png` | Requires `SM_ORG_ID`. At least one machine account must exist. |
| | `sm-machine-account-projects.png` | Machine account detail > Projects tab. |
| | `sm-machine-account-people.png` | Machine account detail > People tab. |
| | `sm-machine-account-access-tokens.png` | Machine account detail > Access tokens tab. |
| | `sm-machine-account-config.png` | Machine account detail > Config tab. |
| | `sm-machine-account-event-logs.png` | Machine account detail > Event logs tab. |
| `screenshots/web/secretsmanager/sm-integrations.spec.js` | `sm-integrations.png` | Requires `SM_ORG_ID`. |
| `screenshots/web/secretsmanager/sm-trash.spec.js` | `sm-trash.png` | Requires `SM_ORG_ID`. |
| `screenshots/web/secretsmanager/sm-settings.spec.js` | `sm-settings-import.png` | Requires `SM_ORG_ID`. |
| | `sm-settings-export.png` | |
