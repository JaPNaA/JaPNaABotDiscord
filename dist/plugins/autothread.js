"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const plugin_js_1 = __importDefault(require("../main/bot/plugin/plugin.js"));
const commandOptions_js_1 = __importDefault(require("../main/bot/command/commandOptions.js"));
const commandHelp_js_1 = __importDefault(require("../main/bot/command/commandHelp.js"));
const ellipsisize_js_1 = __importDefault(require("../main/utils/str/ellipsisize.js"));
/**
 * Autothread plugin; automatically makes threads
 */
class AutoThread extends plugin_js_1.default {
    userConfigSchema = {
        enabled: {
            type: "boolean",
            comment: "Automatically create threads and other side effects?",
            default: false
        },
        cooldownTime: {
            type: "number",
            comment: "How many seconds until another thread is created?",
            default: 30
        },
        disableChatCooldown: {
            type: "boolean",
            comment: "Automatically disable chatting while on cooldown?",
            default: true
        }
    };
    cooldowns = new Map();
    cooldownCancelFuncs = [];
    constructor(bot) {
        super(bot);
        this.pluginName = "autothread";
    }
    async toggleAutothread(event) {
        const channel = await this.bot.client.getChannel(event.channelId);
        if (!channel || channel.isThread()) {
            this.bot.client.send(event.channelId, "Cannot create threads inside threads.");
            return;
        }
        const isEnabled = await this.config.getInChannel(event.channelId, "enabled");
        if (isEnabled) {
            this.config.setInChannel(event.channelId, "enabled", false);
            this.bot.client.send(event.channelId, "Autothread disabled.");
        }
        else {
            this.config.setInChannel(event.channelId, "enabled", true);
            this.bot.client.send(event.channelId, "Autothread enabled.");
        }
    }
    async messageHandler(event) {
        const config = await this.config.getAllUserSettingsInChannel(event.channelId);
        if (!config.get("enabled")) {
            return;
        }
        if (!(await this._isNaturalMessage(event))) {
            return;
        }
        const channel = await this.bot.client.getChannel(event.channelId);
        if (!channel || channel.isThread()) {
            return;
        }
        if (!this.isCool(event.channelId)) {
            return;
        }
        const cooldownTime = config.get("cooldownTime") * 1000;
        const disableChatCooldown = config.get("disableChatCooldown");
        channel.threads.create({
            name: (0, ellipsisize_js_1.default)(this.extractTitleFromMessage(event.message) || "Untitled", 100),
            startMessage: event.messageId
        });
        this.setCooldown(event.channelId, cooldownTime);
        if (disableChatCooldown) {
            // prevent people from sending messages while on cooldown
            channel.permissionOverwrites.create(channel.guild.roles.everyone, { SEND_MESSAGES: false });
            this.addCooldownDoneTimeout(() => channel.permissionOverwrites.delete(channel.guild.roles.everyone), cooldownTime);
        }
    }
    addCooldownDoneTimeout(func, cooldownTime) {
        const timeout = setTimeout(() => {
            func();
        }, cooldownTime);
        const cancelFunc = () => {
            clearTimeout(timeout);
            func();
            this.cooldownCancelFuncs.splice(this.cooldownCancelFuncs.indexOf(cancelFunc), 1);
        };
        this.cooldownCancelFuncs.push(cancelFunc);
    }
    extractTitleFromMessage(message) {
        const firstLine = message.split("\n").find(e => e.trim());
        // back out of extraction
        if (!firstLine) {
            return message;
        }
        // already short enough -- no need for further extraction
        if (firstLine.length < 25) {
            return firstLine;
        }
        const extractedTitle = firstLine.split(/\s+/)
            .filter(e => !STOP_WORDS.has(e.replace(/\W/g, "").toLowerCase())).join(" ");
        // extracted nothing, back out
        if (extractedTitle.length === 0) {
            return firstLine;
        }
        return extractedTitle;
    }
    async _isNaturalMessage(event) {
        const user = await this.bot.client.getUser(event.userId);
        return Boolean(!event.precommandName && // is not a command
            user && !user.bot);
    }
    isCool(channelId) {
        const cooldown = this.cooldowns.get(channelId);
        return !cooldown || cooldown <= Date.now();
    }
    setCooldown(channelId, time) {
        this.cooldowns.set(channelId, Date.now() + time);
    }
    _start() {
        this._registerDefaultCommand("autothread", this.toggleAutothread, new commandOptions_js_1.default({
            group: "Communication",
            help: new commandHelp_js_1.default({
                description: "Enables autothread (making threads) for the channel.",
                examples: [
                    ["autothread", "Toggles autothread on the channel"]
                ]
            }),
            noDM: true
        }));
        this._registerEventHandler("message", this.messageHandler);
    }
    _stop() {
        while (this.cooldownCancelFuncs.length > 0) {
            this.cooldownCancelFuncs[this.cooldownCancelFuncs.length - 1]();
        }
    }
}
exports.default = AutoThread;
const STOP_WORDS = new Set(`i
me
my
myself
we
our
ours
ourselves
you
your
yours
yourself
yourselves
he
him
his
himself
she
her
hers
herself
it
its
itself
they
them
their
theirs
themselves
what
which
who
whom
this
that
these
those
am
is
are
was
were
be
been
being
have
has
had
having
do
does
did
doing
a
an
the
and
but
if
or
because
as
until
while
of
at
by
for
with
about
against
between
into
through
during
before
after
above
below
to
from
up
down
in
out
on
off
over
under
again
further
then
once
here
there
when
where
why
how
all
any
both
each
few
more
most
other
some
such
no
nor
not
only
own
same
so
than
too
very
s
t
can
will
just
don
should
now
literally
bruh
lol`.split("\n"));
