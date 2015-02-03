---
codepen: false
comments: true
date: 2015-02-03
disqus: false
layout: none
preview: false
published: true
sassmeister: false
summary: false
title: "Translating Sass Guidelines"
---

{% raw %}
A couple of weeks ago, I [introduced Sass Guidelines](http://hugogiraudel.com/2015/01/07/introducing-sass-guidelines/), a huge styleguide to write efficient, sain and scalable Sass code in pretty much any project. It has known a massive success, so thank you all for your support! I am very glad to maintain this project knowning how popular it has gotten, especially this quick.

Actually, it was so welcome that some lovely folks started translating it in different languages. It is currently available in [English](http://sass-guidelin.es), [French](http://sass-guidelin.es/fr/) and [Polish](http://sass-guidelin.es/pl/). [German](https://github.com/HugoGiraudel/sass-guidelines/issues/88), [Spanish](https://github.com/HugoGiraudel/sass-guidelines/issues/90), [Italian](https://github.com/HugoGiraudel/sass-guidelines/issues/91), [Portuguese](https://github.com/HugoGiraudel/sass-guidelines/issues/89), [Danish](https://github.com/HugoGiraudel/sass-guidelines/issues/84), [Dutch](https://github.com/HugoGiraudel/sass-guidelines/issues/86), [Russian](https://github.com/HugoGiraudel/sass-guidelines/issues/97), [Czech](https://github.com/HugoGiraudel/sass-guidelines/issues/92) and [Greek](https://github.com/HugoGiraudel/sass-guidelines/issues/83) should soon follow. Let's give credits where it's due while we're at it.

* Greek: [Adonis K.](https://twitter.com/adon1sk) and [Konstantinos Margaritis](https://twitter.com/kmargaritis)
* Danish: [Patrick Redzdaz](https://twitter.com/redzdaz)
* French: [Pierre Choffé](https://twitter.com/pierrechoffe)
* Dutch: [Tom De Witt](https://twitter.com/ttomdewit) and [Bart Veneman](https://twitter.com/BartVeneman)
* Polish: [Andrzej Kłapeć](https://twitter.com/solidslash) and [Mateusz Chabros](https://twitter.com/matchabros)
* German: [Kai Brueckers](https://twitter.com/kaibrueckers) and [Al Tembo](https://twitter.com/altembo)
* Portuguese: [Ricardo Magalhães](https://twitter.com/magalhini), [Sara Vieira](https://twitter.com/nikkitaftw) and [Eduardo Bourças](https://twitter.com/eduardoboucas)
* Spanish: [Sonia Conde](https://twitter.com/nonlessorganic) and [David Khourshid](https://twitter.com/davidkpiano)
* Italian: [Simone Rescio](https://twitter.com/srescio)
* Czech: [Pavel Antolík](https://twitter.com/pavelantolik)
* Russian: [Даниил Пронин](https://twitter.com/grawl) and [Pavel Demyanenko](https://twitter.com/PavelDemyanenko)

If you read Sass Guidelines in anything but English, be sure to thank the translators. I am sure that will make their day. :)

Anyway, managing different languages as part of a [Jekyll](http://jekyllrb.com) powered site turned out to be quite an interesting challenge in order to keep everything scalable, so I thought *why not writing about this*. Hence you reading this.

## Translating the content

A translation of Sass Guidelines consists on a folder named after the [language code](http://www.w3.org/TR/html401/types.html#type-langcode) of the translation, for instance `en` for English, or `cz` for Czech. This folder should contain all 18 chapters in Markdown (one file per chapter) as well as an `index.md` file to import them all.

For instance, the [French translation](https://github.com/HugoGiraudel/sass-guidelines/tree/gh-pages/fr) looks like this:

```
fr/
 |- _architecture.md
 |- _author.md
 |- _comments.md
 |- _conditions.md
 |- _contributing.md
 |- _errors.md
 |- _extend.md
 |- _introduction.md
 |- _loops.md
 |- _mixins.md
 |- _naming.md
 |- _rwd.md
 |- _sass.md
 |- _syntax.md
 |- _tldr.md
 |- _toc.md
 |- _tools.md
 |- _variables.md
 `- index.md
```

However I did not want each translation's index to be in charge of importing the chapters in the correct order. What if I want to switch the position of two chapters? Having to update all `index.md` is not very convenient. Furthermore, some chapters are separated by the [donate partial](https://github.com/HugoGiraudel/sass-guidelines/blob/gh-pages/_includes/donate.html). This should not be language-specific but a global configuration.

Thus, I found a way to keep `index.md` clean and tidy, like so:

```liquid
---
layout: default
language: fr
---

{% include chapters.html %}
```

That's it. The only difference between the French index and the Polish index is the `language` variable in the YAML Front Matter. Everything else is handled by `chapters.html`.

[This file](https://github.com/HugoGiraudel/sass-guidelines/blob/gh-pages/_includes/chapters.html) (living in the `_includes` folder) is in charge of including all chapters from the current page language in the right order, including the donate partials. Thanks to `include_relative` tag, it gets extremely easy to do:

```liquid
{% include_relative _author.md %}
{% include_relative _contributing.md %}
{% include_relative _toc.md %}

{% include_relative _sass.md %}
{% include_relative _introduction.md %}
{% include_relative _syntax.md %}

{% include donate.html %}

{% include_relative _naming.md %}
{% include_relative _comments.md %}
{% include_relative _architecture.md %}
{% include_relative _rwd.md %}

{% include donate.html %}

{% include_relative _variables.md %}
{% include_relative _extend.md %}
{% include_relative _mixins.md %}
{% include_relative _conditions.md %}

{% include donate.html %}

{% include_relative _loops.md %}
{% include_relative _errors.md %}
{% include_relative _tools.md %}
{% include_relative _tldr.md %}

{% include donate.html %}
```

[This tag](http://jekyllrb.com/docs/templates/#including-files-relative-to-another-file) from Jekyll makes it possible to include a file not from the `_includes` folder but from the current folder. Now this is where it's getting tricky: while `chapters.html` lives in `_includes`, `{% include_relative %}` doesn't include from the `_includes` folder but from the folder where lives the requested page (including `chapters.html`), for instance `fr/`.

That's pretty much how it works.

## Translating the UI

Now, content is not everything <sup>[citation needed]</sup>. There are also some UI components to translate, such as the [baseline](https://github.com/HugoGiraudel/sass-guidelines/blob/gh-pages/_layouts/default.html#L11), the [footer](https://github.com/HugoGiraudel/sass-guidelines/blob/gh-pages/_includes/footer.html) and the [donate partial](https://github.com/HugoGiraudel/sass-guidelines/blob/gh-pages/_includes/donate.html).

In a matter of convenience, all UI translations live in a [`translations.yml`](https://github.com/HugoGiraudel/sass-guidelines/blob/gh-pages/_data/translations.yml) file in the `_data` folder so they can be accessed from the views. This file is structured as follow:

```yml
en:
  donate:
    content: "If you enjoy Sass Guidelines, please consider supporting them."
    button: "Support Sass Guidelines"
  baseline:
    content: "An opinionated styleguide for writing sane, maintainable and scalable Sass."
  footer:
    content: "Made with love by [Hugo Giraudel](http://hugogiraudel.com)"
  note: "Note"

# Other languages...
```

At this point, it is a breeze to access to this content from a partial, such as `donate.html`.

```markup
<div class="donate">
  <div class="donate__content">
    <p>{{ site.data.translations[page.language].donate.content }}</p>
    <a href="https://gum.co/sass-guidelines" target="_blank" class="button">
      {{ site.data.translations[page.language].donate.button }}
    </a>
  </div>
</div>
```
Easy peasy! It works exactly the same for the baseline, the footer and pretty much any UI component we want to translate to the current language. Pretty neat, right?

## Displaying credits per translation

If you have checked one of the currently available translations, you may have noticed a message right under the baseline introducting the translators and warning about outdated information. Obviously, this is not manually computed. Actually, data is pulled from another YML file, [`languages.yml`](https://github.com/HugoGiraudel/sass-guidelines/blob/gh-pages/_data/languages.yml) this time, looking like this:

```yml
fr:
  version: 1.0.0
  label: French
  prefix: /fr/
  available: true
  translators:
    - name: Pierre Choffé
      link: http://la-cascade.ghost.io

# Other languages...
```

I am sure you have figured out where this is going. We only need [a partial included within the layout itself](https://github.com/HugoGiraudel/sass-guidelines/blob/gh-pages/_layouts/default.html#L13) (since it is always there). Let's call it [`translation-warning.html`](https://github.com/HugoGiraudel/sass-guidelines/blob/gh-pages/_includes/translation-warning.html). One thing before jumping on the code: we need to display a completely different message on the English version. I took this as an opportunity to tell people Sass Guidelines are being translated in other languages so they can switch from the options panel.

```markup
{% if page.language == "en" %}

  <div class="translation-warning">
    <p>The Sass Guidelines project has been translated into several languages by <a target="_blank" href="https://github.com/HugoGiraudel/sass-guidelines/blob/gh-pages/_data/languages.yml">generous contributors</a>. Open the <span data-toggle="aside" class="link-like" role="button" aria-expanded>options panel</span> to switch.</p>
  </div>

{% else %}

  {% capture translators %}{% for translator in site.data.languages[page.language].translators %}<a href="{{ translator.link }}" target="_blank">{{ translator.name }}</a>{% if forloop.last == false %}, {% endif %}{% endfor %}{% endcapture %}

  <div class="translation-warning">
    <p>You are viewing the {{ site.data.languages[page.language].label }} translation by {{ translators }} of the original <a href="/">Sass Guidelines</a> from <a target="_blank" href="http://hugogiraudel.com">Hugo Giraudel</a>.</p>
    <p>This version is exclusively maintained by contributors without the review of the main author, therefore might not be completely up-to-date{% if site.data.languages[page.language].version != site.data.languages.en.version %}, especially since it is currently in version {{ site.data.languages[page.language].version }} while the <a href="/">English version</a> is in version {{ site.data.languages.en.version }}{% endif %}.</p>
  </div>

{% endif %}
```

Okay, that might look a little complicated. Worry not, it is not as complex as it looks. Let's leave aside the English part since it is fairly obvious, to focus on the `{% else %}` block. The first thing we need is to compute a string from the array of translators with have in our YML file. This is what the `{% capture %}` tag does.

A YML such as:

```yaml
gr:
  version: 1.0.0
  label: Greek
  prefix: /gr/
  available: false
  translators:
    - name: Adonis K.
      link: https://github.com/varemenos
    - name: Konstantinos Margaritis
      link: https://github.com/kmargaritis
```

... will be captured as this HTML string

```markup
<a href="https://github.com/varemenos">Adonis K.</a>, <a href="https://github.com/kmargaritis">Konstantinos Margaritis</a>
```

Then this HTML string can be safely used as part of our paragraph with `{{ translators }}`.

The second paragraph is intended to warn against outdated information. To make it quite clear when a version is obsolete, we compare [the English version](https://github.com/HugoGiraudel/sass-guidelines/blob/gh-pages/_data/languages.yml#L29) (stored in the `languages.yml`) with the current language's version. If the latter is lower, then it means the translation is outdated, in which case we explicitly say it.

## Final thoughts

I am still looking for extra languages, such as Chinese, Japanese, Norwegian, Swedish, Finnish, and so on. If you speak one of these languages or know someone who would like to translate Sass Guidelines, please be sure to get in touch!


{% endraw %}