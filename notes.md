Learning about clip paths, inset, position relative absolute fixed

https://www.easings.dev/

https://emilkowal.ski/ui/the-magic-of-clip-path


23 June Class

Wrapping up CSS

2 libraries for animations: gsap and motion.dev

*Functions

function functionName (width, height){
    return width * height;
}

1. is operator is a shorthand..it condenses

:is (main, footer) :is (h1, p) {
    color: green;
}

INSTEAD OF 

main h1 {
...
}
main p {
...
}
footer h1 {
..
}
footer p {
...
}

2. Custom properties & var

3. Attribute
- it allows you to take attributes of that element
- It allows us to pull in the content of our class to displayed.
- FIND USE CASE

Sidenote:
- there is a differenec between button:hi & button .hi

4. url

5. Calc


6. min() max()
- works well when one of the items is dynamic and the other static
- e.g width: min (20vw, 30rem);
in this scenario 20vw is dynamic(this vw or vh is a percentage of the screen, it changes as the screen reduces and increases in size) and 30 rem is static.
- min function, i give it a list of values and it takes the minimum value
- Find out how to relate vw and vh to pixels. 20% of screen in width is 20vw
- max function, it takes the maximum value

7. clamp ()
- takes min, ideal and max size
- you can use this for font sizes (fluid) so that you do not have to manually use media queries

**Animations

1. ease-in-out most realistic 
2. learn about all the animation shotrhands

*Filters

2. backdrop-filter: blur. It applies the filter to whatever is beneath it the actual image
3. filter: blur(4px); it applies the filter blur to the element itself.
3. brightness
4. contrast
5. grayscale
6. invert
7. opacity
8. saturation
9. sepia
10. hue-rotate
11. Diff between box-shadow (creates shadow that is Always rectangular (ignores transparent areas of the box)).and drop-shadow (shadow Follows the exact contours of your visible content (like transparent PNGs or SVGs).)
12. Blend-mode (there are diff types of blend modes..its like photoshop)

*Lists
1. you can put text, bullet point, image, gif as a marker in a list
2. pseudo-element ::marker (checkout its properties)

*Counters

*Transitions

*View Transitions for SPAs

*Overflow
1. text overflow: ellipsis; if text if super long it changes from this jskskidjdkdojdnk to jskskidjdkdoj...
2. logical properties for overflow
3. You can style your scrollbar
4. You can change scroll bar behaviour


Sidenote: postcss transforms your css so that its compatible with all browsers

*Container 
1. container queries (respond to container size) VS Media queries(respond to screen size)
2. Container query is more powerfulbecause you can specify what type of container

1940pm to 22:40pm 3 hours
READ CSS CONTENT!!


24 June 2026

Started at 2030pm to 2310pm

- Use radix ui and base ui to build certain features
- READ ON MIT License
- Did practicals (built a marquee from supabase.com, built the live animation on instagram, built a mansory layout)



