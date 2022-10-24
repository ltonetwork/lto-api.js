/*
 * jsrsasign(ecdsa) 10.5.27 (2022-10-24) (c) 2010-2022 Kenji Urushima | kjur.github.io/jsrsasign/license
 */


var navigator = {};
navigator.userAgent = false;

var window = {};
/*! (c) Tom Wu | http://www-cs-students.stanford.edu/~tjw/jsbn/
 */
var dbits;var canary=244837814094590;var j_lm=((canary&16777215)==15715070);function BigInteger(e,d,f){if(e!=null){if("number"==typeof e){this.fromNumber(e,d,f)}else{if(d==null&&"string"!=typeof e){this.fromString(e,256)}else{this.fromString(e,d)}}}}function nbi(){return new BigInteger(null)}function am1(f,a,b,e,h,g){while(--g>=0){var d=a*this[f++]+b[e]+h;h=Math.floor(d/67108864);b[e++]=d&67108863}return h}function am2(f,q,r,e,o,a){var k=q&32767,p=q>>15;while(--a>=0){var d=this[f]&32767;var g=this[f++]>>15;var b=p*d+g*k;d=k*d+((b&32767)<<15)+r[e]+(o&1073741823);o=(d>>>30)+(b>>>15)+p*g+(o>>>30);r[e++]=d&1073741823}return o}function am3(f,q,r,e,o,a){var k=q&16383,p=q>>14;while(--a>=0){var d=this[f]&16383;var g=this[f++]>>14;var b=p*d+g*k;d=k*d+((b&16383)<<14)+r[e]+o;o=(d>>28)+(b>>14)+p*g;r[e++]=d&268435455}return o}if(j_lm&&(navigator.appName=="Microsoft Internet Explorer")){BigInteger.prototype.am=am2;dbits=30}else{if(j_lm&&(navigator.appName!="Netscape")){BigInteger.prototype.am=am1;dbits=26}else{BigInteger.prototype.am=am3;dbits=28}}BigInteger.prototype.DB=dbits;BigInteger.prototype.DM=((1<<dbits)-1);BigInteger.prototype.DV=(1<<dbits);var BI_FP=52;BigInteger.prototype.FV=Math.pow(2,BI_FP);BigInteger.prototype.F1=BI_FP-dbits;BigInteger.prototype.F2=2*dbits-BI_FP;var BI_RM="0123456789abcdefghijklmnopqrstuvwxyz";var BI_RC=new Array();var rr,vv;rr="0".charCodeAt(0);for(vv=0;vv<=9;++vv){BI_RC[rr++]=vv}rr="a".charCodeAt(0);for(vv=10;vv<36;++vv){BI_RC[rr++]=vv}rr="A".charCodeAt(0);for(vv=10;vv<36;++vv){BI_RC[rr++]=vv}function int2char(a){return BI_RM.charAt(a)}function intAt(b,a){var d=BI_RC[b.charCodeAt(a)];return(d==null)?-1:d}function bnpCopyTo(b){for(var a=this.t-1;a>=0;--a){b[a]=this[a]}b.t=this.t;b.s=this.s}function bnpFromInt(a){this.t=1;this.s=(a<0)?-1:0;if(a>0){this[0]=a}else{if(a<-1){this[0]=a+this.DV}else{this.t=0}}}function nbv(a){var b=nbi();b.fromInt(a);return b}function bnpFromString(h,c){var e;if(c==16){e=4}else{if(c==8){e=3}else{if(c==256){e=8}else{if(c==2){e=1}else{if(c==32){e=5}else{if(c==4){e=2}else{this.fromRadix(h,c);return}}}}}}this.t=0;this.s=0;var g=h.length,d=false,f=0;while(--g>=0){var a=(e==8)?h[g]&255:intAt(h,g);if(a<0){if(h.charAt(g)=="-"){d=true}continue}d=false;if(f==0){this[this.t++]=a}else{if(f+e>this.DB){this[this.t-1]|=(a&((1<<(this.DB-f))-1))<<f;this[this.t++]=(a>>(this.DB-f))}else{this[this.t-1]|=a<<f}}f+=e;if(f>=this.DB){f-=this.DB}}if(e==8&&(h[0]&128)!=0){this.s=-1;if(f>0){this[this.t-1]|=((1<<(this.DB-f))-1)<<f}}this.clamp();if(d){BigInteger.ZERO.subTo(this,this)}}function bnpClamp(){var a=this.s&this.DM;while(this.t>0&&this[this.t-1]==a){--this.t}}function bnToString(c){if(this.s<0){return"-"+this.negate().toString(c)}var e;if(c==16){e=4}else{if(c==8){e=3}else{if(c==2){e=1}else{if(c==32){e=5}else{if(c==4){e=2}else{return this.toRadix(c)}}}}}var g=(1<<e)-1,l,a=false,h="",f=this.t;var j=this.DB-(f*this.DB)%e;if(f-->0){if(j<this.DB&&(l=this[f]>>j)>0){a=true;h=int2char(l)}while(f>=0){if(j<e){l=(this[f]&((1<<j)-1))<<(e-j);l|=this[--f]>>(j+=this.DB-e)}else{l=(this[f]>>(j-=e))&g;if(j<=0){j+=this.DB;--f}}if(l>0){a=true}if(a){h+=int2char(l)}}}return a?h:"0"}function bnNegate(){var a=nbi();BigInteger.ZERO.subTo(this,a);return a}function bnAbs(){return(this.s<0)?this.negate():this}function bnCompareTo(b){var d=this.s-b.s;if(d!=0){return d}var c=this.t;d=c-b.t;if(d!=0){return(this.s<0)?-d:d}while(--c>=0){if((d=this[c]-b[c])!=0){return d}}return 0}function nbits(a){var c=1,b;if((b=a>>>16)!=0){a=b;c+=16}if((b=a>>8)!=0){a=b;c+=8}if((b=a>>4)!=0){a=b;c+=4}if((b=a>>2)!=0){a=b;c+=2}if((b=a>>1)!=0){a=b;c+=1}return c}function bnBitLength(){if(this.t<=0){return 0}return this.DB*(this.t-1)+nbits(this[this.t-1]^(this.s&this.DM))}function bnpDLShiftTo(c,b){var a;for(a=this.t-1;a>=0;--a){b[a+c]=this[a]}for(a=c-1;a>=0;--a){b[a]=0}b.t=this.t+c;b.s=this.s}function bnpDRShiftTo(c,b){for(var a=c;a<this.t;++a){b[a-c]=this[a]}b.t=Math.max(this.t-c,0);b.s=this.s}function bnpLShiftTo(j,e){var b=j%this.DB;var a=this.DB-b;var g=(1<<a)-1;var f=Math.floor(j/this.DB),h=(this.s<<b)&this.DM,d;for(d=this.t-1;d>=0;--d){e[d+f+1]=(this[d]>>a)|h;h=(this[d]&g)<<b}for(d=f-1;d>=0;--d){e[d]=0}e[f]=h;e.t=this.t+f+1;e.s=this.s;e.clamp()}function bnpRShiftTo(g,d){d.s=this.s;var e=Math.floor(g/this.DB);if(e>=this.t){d.t=0;return}var b=g%this.DB;var a=this.DB-b;var f=(1<<b)-1;d[0]=this[e]>>b;for(var c=e+1;c<this.t;++c){d[c-e-1]|=(this[c]&f)<<a;d[c-e]=this[c]>>b}if(b>0){d[this.t-e-1]|=(this.s&f)<<a}d.t=this.t-e;d.clamp()}function bnpSubTo(d,f){var e=0,g=0,b=Math.min(d.t,this.t);while(e<b){g+=this[e]-d[e];f[e++]=g&this.DM;g>>=this.DB}if(d.t<this.t){g-=d.s;while(e<this.t){g+=this[e];f[e++]=g&this.DM;g>>=this.DB}g+=this.s}else{g+=this.s;while(e<d.t){g-=d[e];f[e++]=g&this.DM;g>>=this.DB}g-=d.s}f.s=(g<0)?-1:0;if(g<-1){f[e++]=this.DV+g}else{if(g>0){f[e++]=g}}f.t=e;f.clamp()}function bnpMultiplyTo(c,e){var b=this.abs(),f=c.abs();var d=b.t;e.t=d+f.t;while(--d>=0){e[d]=0}for(d=0;d<f.t;++d){e[d+b.t]=b.am(0,f[d],e,d,0,b.t)}e.s=0;e.clamp();if(this.s!=c.s){BigInteger.ZERO.subTo(e,e)}}function bnpSquareTo(d){var a=this.abs();var b=d.t=2*a.t;while(--b>=0){d[b]=0}for(b=0;b<a.t-1;++b){var e=a.am(b,a[b],d,2*b,0,1);if((d[b+a.t]+=a.am(b+1,2*a[b],d,2*b+1,e,a.t-b-1))>=a.DV){d[b+a.t]-=a.DV;d[b+a.t+1]=1}}if(d.t>0){d[d.t-1]+=a.am(b,a[b],d,2*b,0,1)}d.s=0;d.clamp()}function bnpDivRemTo(n,h,g){var w=n.abs();if(w.t<=0){return}var k=this.abs();if(k.t<w.t){if(h!=null){h.fromInt(0)}if(g!=null){this.copyTo(g)}return}if(g==null){g=nbi()}var d=nbi(),a=this.s,l=n.s;var v=this.DB-nbits(w[w.t-1]);if(v>0){w.lShiftTo(v,d);k.lShiftTo(v,g)}else{w.copyTo(d);k.copyTo(g)}var p=d.t;var b=d[p-1];if(b==0){return}var o=b*(1<<this.F1)+((p>1)?d[p-2]>>this.F2:0);var A=this.FV/o,z=(1<<this.F1)/o,x=1<<this.F2;var u=g.t,s=u-p,f=(h==null)?nbi():h;d.dlShiftTo(s,f);if(g.compareTo(f)>=0){g[g.t++]=1;g.subTo(f,g)}BigInteger.ONE.dlShiftTo(p,f);f.subTo(d,d);while(d.t<p){d[d.t++]=0}while(--s>=0){var c=(g[--u]==b)?this.DM:Math.floor(g[u]*A+(g[u-1]+x)*z);if((g[u]+=d.am(0,c,g,s,0,p))<c){d.dlShiftTo(s,f);g.subTo(f,g);while(g[u]<--c){g.subTo(f,g)}}}if(h!=null){g.drShiftTo(p,h);if(a!=l){BigInteger.ZERO.subTo(h,h)}}g.t=p;g.clamp();if(v>0){g.rShiftTo(v,g)}if(a<0){BigInteger.ZERO.subTo(g,g)}}function bnMod(b){var c=nbi();this.abs().divRemTo(b,null,c);if(this.s<0&&c.compareTo(BigInteger.ZERO)>0){b.subTo(c,c)}return c}function Classic(a){this.m=a}function cConvert(a){if(a.s<0||a.compareTo(this.m)>=0){return a.mod(this.m)}else{return a}}function cRevert(a){return a}function cReduce(a){a.divRemTo(this.m,null,a)}function cMulTo(a,c,b){a.multiplyTo(c,b);this.reduce(b)}function cSqrTo(a,b){a.squareTo(b);this.reduce(b)}Classic.prototype.convert=cConvert;Classic.prototype.revert=cRevert;Classic.prototype.reduce=cReduce;Classic.prototype.mulTo=cMulTo;Classic.prototype.sqrTo=cSqrTo;function bnpInvDigit(){if(this.t<1){return 0}var a=this[0];if((a&1)==0){return 0}var b=a&3;b=(b*(2-(a&15)*b))&15;b=(b*(2-(a&255)*b))&255;b=(b*(2-(((a&65535)*b)&65535)))&65535;b=(b*(2-a*b%this.DV))%this.DV;return(b>0)?this.DV-b:-b}function Montgomery(a){this.m=a;this.mp=a.invDigit();this.mpl=this.mp&32767;this.mph=this.mp>>15;this.um=(1<<(a.DB-15))-1;this.mt2=2*a.t}function montConvert(a){var b=nbi();a.abs().dlShiftTo(this.m.t,b);b.divRemTo(this.m,null,b);if(a.s<0&&b.compareTo(BigInteger.ZERO)>0){this.m.subTo(b,b)}return b}function montRevert(a){var b=nbi();a.copyTo(b);this.reduce(b);return b}function montReduce(a){while(a.t<=this.mt2){a[a.t++]=0}for(var c=0;c<this.m.t;++c){var b=a[c]&32767;var d=(b*this.mpl+(((b*this.mph+(a[c]>>15)*this.mpl)&this.um)<<15))&a.DM;b=c+this.m.t;a[b]+=this.m.am(0,d,a,c,0,this.m.t);while(a[b]>=a.DV){a[b]-=a.DV;a[++b]++}}a.clamp();a.drShiftTo(this.m.t,a);if(a.compareTo(this.m)>=0){a.subTo(this.m,a)}}function montSqrTo(a,b){a.squareTo(b);this.reduce(b)}function montMulTo(a,c,b){a.multiplyTo(c,b);this.reduce(b)}Montgomery.prototype.convert=montConvert;Montgomery.prototype.revert=montRevert;Montgomery.prototype.reduce=montReduce;Montgomery.prototype.mulTo=montMulTo;Montgomery.prototype.sqrTo=montSqrTo;function bnpIsEven(){return((this.t>0)?(this[0]&1):this.s)==0}function bnpExp(h,j){if(h>4294967295||h<1){return BigInteger.ONE}var f=nbi(),a=nbi(),d=j.convert(this),c=nbits(h)-1;d.copyTo(f);while(--c>=0){j.sqrTo(f,a);if((h&(1<<c))>0){j.mulTo(a,d,f)}else{var b=f;f=a;a=b}}return j.revert(f)}function bnModPowInt(b,a){var c;if(b<256||a.isEven()){c=new Classic(a)}else{c=new Montgomery(a)}return this.exp(b,c)}BigInteger.prototype.copyTo=bnpCopyTo;BigInteger.prototype.fromInt=bnpFromInt;BigInteger.prototype.fromString=bnpFromString;BigInteger.prototype.clamp=bnpClamp;BigInteger.prototype.dlShiftTo=bnpDLShiftTo;BigInteger.prototype.drShiftTo=bnpDRShiftTo;BigInteger.prototype.lShiftTo=bnpLShiftTo;BigInteger.prototype.rShiftTo=bnpRShiftTo;BigInteger.prototype.subTo=bnpSubTo;BigInteger.prototype.multiplyTo=bnpMultiplyTo;BigInteger.prototype.squareTo=bnpSquareTo;BigInteger.prototype.divRemTo=bnpDivRemTo;BigInteger.prototype.invDigit=bnpInvDigit;BigInteger.prototype.isEven=bnpIsEven;BigInteger.prototype.exp=bnpExp;BigInteger.prototype.toString=bnToString;BigInteger.prototype.negate=bnNegate;BigInteger.prototype.abs=bnAbs;BigInteger.prototype.compareTo=bnCompareTo;BigInteger.prototype.bitLength=bnBitLength;BigInteger.prototype.mod=bnMod;BigInteger.prototype.modPowInt=bnModPowInt;BigInteger.ZERO=nbv(0);BigInteger.ONE=nbv(1);
/*! (c) Tom Wu | http://www-cs-students.stanford.edu/~tjw/jsbn/
 */
function bnClone(){var a=nbi();this.copyTo(a);return a}function bnIntValue(){if(this.s<0){if(this.t==1){return this[0]-this.DV}else{if(this.t==0){return -1}}}else{if(this.t==1){return this[0]}else{if(this.t==0){return 0}}}return((this[1]&((1<<(32-this.DB))-1))<<this.DB)|this[0]}function bnByteValue(){return(this.t==0)?this.s:(this[0]<<24)>>24}function bnShortValue(){return(this.t==0)?this.s:(this[0]<<16)>>16}function bnpChunkSize(a){return Math.floor(Math.LN2*this.DB/Math.log(a))}function bnSigNum(){if(this.s<0){return -1}else{if(this.t<=0||(this.t==1&&this[0]<=0)){return 0}else{return 1}}}function bnpToRadix(c){if(c==null){c=10}if(this.signum()==0||c<2||c>36){return"0"}var f=this.chunkSize(c);var e=Math.pow(c,f);var i=nbv(e),j=nbi(),h=nbi(),g="";this.divRemTo(i,j,h);while(j.signum()>0){g=(e+h.intValue()).toString(c).substr(1)+g;j.divRemTo(i,j,h)}return h.intValue().toString(c)+g}function bnpFromRadix(m,h){this.fromInt(0);if(h==null){h=10}var f=this.chunkSize(h);var g=Math.pow(h,f),e=false,a=0,l=0;for(var c=0;c<m.length;++c){var k=intAt(m,c);if(k<0){if(m.charAt(c)=="-"&&this.signum()==0){e=true}continue}l=h*l+k;if(++a>=f){this.dMultiply(g);this.dAddOffset(l,0);a=0;l=0}}if(a>0){this.dMultiply(Math.pow(h,a));this.dAddOffset(l,0)}if(e){BigInteger.ZERO.subTo(this,this)}}function bnpFromNumber(f,e,h){if("number"==typeof e){if(f<2){this.fromInt(1)}else{this.fromNumber(f,h);if(!this.testBit(f-1)){this.bitwiseTo(BigInteger.ONE.shiftLeft(f-1),op_or,this)}if(this.isEven()){this.dAddOffset(1,0)}while(!this.isProbablePrime(e)){this.dAddOffset(2,0);if(this.bitLength()>f){this.subTo(BigInteger.ONE.shiftLeft(f-1),this)}}}}else{var d=new Array(),g=f&7;d.length=(f>>3)+1;e.nextBytes(d);if(g>0){d[0]&=((1<<g)-1)}else{d[0]=0}this.fromString(d,256)}}function bnToByteArray(){var b=this.t,c=new Array();c[0]=this.s;var e=this.DB-(b*this.DB)%8,f,a=0;if(b-->0){if(e<this.DB&&(f=this[b]>>e)!=(this.s&this.DM)>>e){c[a++]=f|(this.s<<(this.DB-e))}while(b>=0){if(e<8){f=(this[b]&((1<<e)-1))<<(8-e);f|=this[--b]>>(e+=this.DB-8)}else{f=(this[b]>>(e-=8))&255;if(e<=0){e+=this.DB;--b}}if((f&128)!=0){f|=-256}if(a==0&&(this.s&128)!=(f&128)){++a}if(a>0||f!=this.s){c[a++]=f}}}return c}function bnEquals(b){return(this.compareTo(b)==0)}function bnMin(b){return(this.compareTo(b)<0)?this:b}function bnMax(b){return(this.compareTo(b)>0)?this:b}function bnpBitwiseTo(c,h,e){var d,g,b=Math.min(c.t,this.t);for(d=0;d<b;++d){e[d]=h(this[d],c[d])}if(c.t<this.t){g=c.s&this.DM;for(d=b;d<this.t;++d){e[d]=h(this[d],g)}e.t=this.t}else{g=this.s&this.DM;for(d=b;d<c.t;++d){e[d]=h(g,c[d])}e.t=c.t}e.s=h(this.s,c.s);e.clamp()}function op_and(a,b){return a&b}function bnAnd(b){var c=nbi();this.bitwiseTo(b,op_and,c);return c}function op_or(a,b){return a|b}function bnOr(b){var c=nbi();this.bitwiseTo(b,op_or,c);return c}function op_xor(a,b){return a^b}function bnXor(b){var c=nbi();this.bitwiseTo(b,op_xor,c);return c}function op_andnot(a,b){return a&~b}function bnAndNot(b){var c=nbi();this.bitwiseTo(b,op_andnot,c);return c}function bnNot(){var b=nbi();for(var a=0;a<this.t;++a){b[a]=this.DM&~this[a]}b.t=this.t;b.s=~this.s;return b}function bnShiftLeft(b){var a=nbi();if(b<0){this.rShiftTo(-b,a)}else{this.lShiftTo(b,a)}return a}function bnShiftRight(b){var a=nbi();if(b<0){this.lShiftTo(-b,a)}else{this.rShiftTo(b,a)}return a}function lbit(a){if(a==0){return -1}var b=0;if((a&65535)==0){a>>=16;b+=16}if((a&255)==0){a>>=8;b+=8}if((a&15)==0){a>>=4;b+=4}if((a&3)==0){a>>=2;b+=2}if((a&1)==0){++b}return b}function bnGetLowestSetBit(){for(var a=0;a<this.t;++a){if(this[a]!=0){return a*this.DB+lbit(this[a])}}if(this.s<0){return this.t*this.DB}return -1}function cbit(a){var b=0;while(a!=0){a&=a-1;++b}return b}function bnBitCount(){var c=0,a=this.s&this.DM;for(var b=0;b<this.t;++b){c+=cbit(this[b]^a)}return c}function bnTestBit(b){var a=Math.floor(b/this.DB);if(a>=this.t){return(this.s!=0)}return((this[a]&(1<<(b%this.DB)))!=0)}function bnpChangeBit(c,b){var a=BigInteger.ONE.shiftLeft(c);this.bitwiseTo(a,b,a);return a}function bnSetBit(a){return this.changeBit(a,op_or)}function bnClearBit(a){return this.changeBit(a,op_andnot)}function bnFlipBit(a){return this.changeBit(a,op_xor)}function bnpAddTo(d,f){var e=0,g=0,b=Math.min(d.t,this.t);while(e<b){g+=this[e]+d[e];f[e++]=g&this.DM;g>>=this.DB}if(d.t<this.t){g+=d.s;while(e<this.t){g+=this[e];f[e++]=g&this.DM;g>>=this.DB}g+=this.s}else{g+=this.s;while(e<d.t){g+=d[e];f[e++]=g&this.DM;g>>=this.DB}g+=d.s}f.s=(g<0)?-1:0;if(g>0){f[e++]=g}else{if(g<-1){f[e++]=this.DV+g}}f.t=e;f.clamp()}function bnAdd(b){var c=nbi();this.addTo(b,c);return c}function bnSubtract(b){var c=nbi();this.subTo(b,c);return c}function bnMultiply(b){var c=nbi();this.multiplyTo(b,c);return c}function bnSquare(){var a=nbi();this.squareTo(a);return a}function bnDivide(b){var c=nbi();this.divRemTo(b,c,null);return c}function bnRemainder(b){var c=nbi();this.divRemTo(b,null,c);return c}function bnDivideAndRemainder(b){var d=nbi(),c=nbi();this.divRemTo(b,d,c);return new Array(d,c)}function bnpDMultiply(a){this[this.t]=this.am(0,a-1,this,0,0,this.t);++this.t;this.clamp()}function bnpDAddOffset(b,a){if(b==0){return}while(this.t<=a){this[this.t++]=0}this[a]+=b;while(this[a]>=this.DV){this[a]-=this.DV;if(++a>=this.t){this[this.t++]=0}++this[a]}}function NullExp(){}function nNop(a){return a}function nMulTo(a,c,b){a.multiplyTo(c,b)}function nSqrTo(a,b){a.squareTo(b)}NullExp.prototype.convert=nNop;NullExp.prototype.revert=nNop;NullExp.prototype.mulTo=nMulTo;NullExp.prototype.sqrTo=nSqrTo;function bnPow(a){return this.exp(a,new NullExp())}function bnpMultiplyLowerTo(b,f,e){var d=Math.min(this.t+b.t,f);e.s=0;e.t=d;while(d>0){e[--d]=0}var c;for(c=e.t-this.t;d<c;++d){e[d+this.t]=this.am(0,b[d],e,d,0,this.t)}for(c=Math.min(b.t,f);d<c;++d){this.am(0,b[d],e,d,0,f-d)}e.clamp()}function bnpMultiplyUpperTo(b,e,d){--e;var c=d.t=this.t+b.t-e;d.s=0;while(--c>=0){d[c]=0}for(c=Math.max(e-this.t,0);c<b.t;++c){d[this.t+c-e]=this.am(e-c,b[c],d,0,0,this.t+c-e)}d.clamp();d.drShiftTo(1,d)}function Barrett(a){this.r2=nbi();this.q3=nbi();BigInteger.ONE.dlShiftTo(2*a.t,this.r2);this.mu=this.r2.divide(a);this.m=a}function barrettConvert(a){if(a.s<0||a.t>2*this.m.t){return a.mod(this.m)}else{if(a.compareTo(this.m)<0){return a}else{var b=nbi();a.copyTo(b);this.reduce(b);return b}}}function barrettRevert(a){return a}function barrettReduce(a){a.drShiftTo(this.m.t-1,this.r2);if(a.t>this.m.t+1){a.t=this.m.t+1;a.clamp()}this.mu.multiplyUpperTo(this.r2,this.m.t+1,this.q3);this.m.multiplyLowerTo(this.q3,this.m.t+1,this.r2);while(a.compareTo(this.r2)<0){a.dAddOffset(1,this.m.t+1)}a.subTo(this.r2,a);while(a.compareTo(this.m)>=0){a.subTo(this.m,a)}}function barrettSqrTo(a,b){a.squareTo(b);this.reduce(b)}function barrettMulTo(a,c,b){a.multiplyTo(c,b);this.reduce(b)}Barrett.prototype.convert=barrettConvert;Barrett.prototype.revert=barrettRevert;Barrett.prototype.reduce=barrettReduce;Barrett.prototype.mulTo=barrettMulTo;Barrett.prototype.sqrTo=barrettSqrTo;function bnModPow(q,f){var o=q.bitLength(),h,b=nbv(1),v;if(o<=0){return b}else{if(o<18){h=1}else{if(o<48){h=3}else{if(o<144){h=4}else{if(o<768){h=5}else{h=6}}}}}if(o<8){v=new Classic(f)}else{if(f.isEven()){v=new Barrett(f)}else{v=new Montgomery(f)}}var p=new Array(),d=3,s=h-1,a=(1<<h)-1;p[1]=v.convert(this);if(h>1){var A=nbi();v.sqrTo(p[1],A);while(d<=a){p[d]=nbi();v.mulTo(A,p[d-2],p[d]);d+=2}}var l=q.t-1,x,u=true,c=nbi(),y;o=nbits(q[l])-1;while(l>=0){if(o>=s){x=(q[l]>>(o-s))&a}else{x=(q[l]&((1<<(o+1))-1))<<(s-o);if(l>0){x|=q[l-1]>>(this.DB+o-s)}}d=h;while((x&1)==0){x>>=1;--d}if((o-=d)<0){o+=this.DB;--l}if(u){p[x].copyTo(b);u=false}else{while(d>1){v.sqrTo(b,c);v.sqrTo(c,b);d-=2}if(d>0){v.sqrTo(b,c)}else{y=b;b=c;c=y}v.mulTo(c,p[x],b)}while(l>=0&&(q[l]&(1<<o))==0){v.sqrTo(b,c);y=b;b=c;c=y;if(--o<0){o=this.DB-1;--l}}}return v.revert(b)}function bnGCD(c){var b=(this.s<0)?this.negate():this.clone();var h=(c.s<0)?c.negate():c.clone();if(b.compareTo(h)<0){var e=b;b=h;h=e}var d=b.getLowestSetBit(),f=h.getLowestSetBit();if(f<0){return b}if(d<f){f=d}if(f>0){b.rShiftTo(f,b);h.rShiftTo(f,h)}while(b.signum()>0){if((d=b.getLowestSetBit())>0){b.rShiftTo(d,b)}if((d=h.getLowestSetBit())>0){h.rShiftTo(d,h)}if(b.compareTo(h)>=0){b.subTo(h,b);b.rShiftTo(1,b)}else{h.subTo(b,h);h.rShiftTo(1,h)}}if(f>0){h.lShiftTo(f,h)}return h}function bnpModInt(e){if(e<=0){return 0}var c=this.DV%e,b=(this.s<0)?e-1:0;if(this.t>0){if(c==0){b=this[0]%e}else{for(var a=this.t-1;a>=0;--a){b=(c*b+this[a])%e}}}return b}function bnModInverse(f){var j=f.isEven();if((this.isEven()&&j)||f.signum()==0){return BigInteger.ZERO}var i=f.clone(),h=this.clone();var g=nbv(1),e=nbv(0),l=nbv(0),k=nbv(1);while(i.signum()!=0){while(i.isEven()){i.rShiftTo(1,i);if(j){if(!g.isEven()||!e.isEven()){g.addTo(this,g);e.subTo(f,e)}g.rShiftTo(1,g)}else{if(!e.isEven()){e.subTo(f,e)}}e.rShiftTo(1,e)}while(h.isEven()){h.rShiftTo(1,h);if(j){if(!l.isEven()||!k.isEven()){l.addTo(this,l);k.subTo(f,k)}l.rShiftTo(1,l)}else{if(!k.isEven()){k.subTo(f,k)}}k.rShiftTo(1,k)}if(i.compareTo(h)>=0){i.subTo(h,i);if(j){g.subTo(l,g)}e.subTo(k,e)}else{h.subTo(i,h);if(j){l.subTo(g,l)}k.subTo(e,k)}}if(h.compareTo(BigInteger.ONE)!=0){return BigInteger.ZERO}if(k.compareTo(f)>=0){return k.subtract(f)}if(k.signum()<0){k.addTo(f,k)}else{return k}if(k.signum()<0){return k.add(f)}else{return k}}var lowprimes=[2,3,5,7,11,13,17,19,23,29,31,37,41,43,47,53,59,61,67,71,73,79,83,89,97,101,103,107,109,113,127,131,137,139,149,151,157,163,167,173,179,181,191,193,197,199,211,223,227,229,233,239,241,251,257,263,269,271,277,281,283,293,307,311,313,317,331,337,347,349,353,359,367,373,379,383,389,397,401,409,419,421,431,433,439,443,449,457,461,463,467,479,487,491,499,503,509,521,523,541,547,557,563,569,571,577,587,593,599,601,607,613,617,619,631,641,643,647,653,659,661,673,677,683,691,701,709,719,727,733,739,743,751,757,761,769,773,787,797,809,811,821,823,827,829,839,853,857,859,863,877,881,883,887,907,911,919,929,937,941,947,953,967,971,977,983,991,997];var lplim=(1<<26)/lowprimes[lowprimes.length-1];function bnIsProbablePrime(e){var d,b=this.abs();if(b.t==1&&b[0]<=lowprimes[lowprimes.length-1]){for(d=0;d<lowprimes.length;++d){if(b[0]==lowprimes[d]){return true}}return false}if(b.isEven()){return false}d=1;while(d<lowprimes.length){var a=lowprimes[d],c=d+1;while(c<lowprimes.length&&a<lplim){a*=lowprimes[c++]}a=b.modInt(a);while(d<c){if(a%lowprimes[d++]==0){return false}}}return b.millerRabin(e)}function bnpMillerRabin(f){var g=this.subtract(BigInteger.ONE);var c=g.getLowestSetBit();if(c<=0){return false}var h=g.shiftRight(c);f=(f+1)>>1;if(f>lowprimes.length){f=lowprimes.length}var b=nbi();for(var e=0;e<f;++e){b.fromInt(lowprimes[Math.floor(Math.random()*lowprimes.length)]);var l=b.modPow(h,this);if(l.compareTo(BigInteger.ONE)!=0&&l.compareTo(g)!=0){var d=1;while(d++<c&&l.compareTo(g)!=0){l=l.modPowInt(2,this);if(l.compareTo(BigInteger.ONE)==0){return false}}if(l.compareTo(g)!=0){return false}}}return true}BigInteger.prototype.chunkSize=bnpChunkSize;BigInteger.prototype.toRadix=bnpToRadix;BigInteger.prototype.fromRadix=bnpFromRadix;BigInteger.prototype.fromNumber=bnpFromNumber;BigInteger.prototype.bitwiseTo=bnpBitwiseTo;BigInteger.prototype.changeBit=bnpChangeBit;BigInteger.prototype.addTo=bnpAddTo;BigInteger.prototype.dMultiply=bnpDMultiply;BigInteger.prototype.dAddOffset=bnpDAddOffset;BigInteger.prototype.multiplyLowerTo=bnpMultiplyLowerTo;BigInteger.prototype.multiplyUpperTo=bnpMultiplyUpperTo;BigInteger.prototype.modInt=bnpModInt;BigInteger.prototype.millerRabin=bnpMillerRabin;BigInteger.prototype.clone=bnClone;BigInteger.prototype.intValue=bnIntValue;BigInteger.prototype.byteValue=bnByteValue;BigInteger.prototype.shortValue=bnShortValue;BigInteger.prototype.signum=bnSigNum;BigInteger.prototype.toByteArray=bnToByteArray;BigInteger.prototype.equals=bnEquals;BigInteger.prototype.min=bnMin;BigInteger.prototype.max=bnMax;BigInteger.prototype.and=bnAnd;BigInteger.prototype.or=bnOr;BigInteger.prototype.xor=bnXor;BigInteger.prototype.andNot=bnAndNot;BigInteger.prototype.not=bnNot;BigInteger.prototype.shiftLeft=bnShiftLeft;BigInteger.prototype.shiftRight=bnShiftRight;BigInteger.prototype.getLowestSetBit=bnGetLowestSetBit;BigInteger.prototype.bitCount=bnBitCount;BigInteger.prototype.testBit=bnTestBit;BigInteger.prototype.setBit=bnSetBit;BigInteger.prototype.clearBit=bnClearBit;BigInteger.prototype.flipBit=bnFlipBit;BigInteger.prototype.add=bnAdd;BigInteger.prototype.subtract=bnSubtract;BigInteger.prototype.multiply=bnMultiply;BigInteger.prototype.divide=bnDivide;BigInteger.prototype.remainder=bnRemainder;BigInteger.prototype.divideAndRemainder=bnDivideAndRemainder;BigInteger.prototype.modPow=bnModPow;BigInteger.prototype.modInverse=bnModInverse;BigInteger.prototype.pow=bnPow;BigInteger.prototype.gcd=bnGCD;BigInteger.prototype.isProbablePrime=bnIsProbablePrime;BigInteger.prototype.square=bnSquare;
/*! (c) Tom Wu | http://www-cs-students.stanford.edu/~tjw/jsbn/
 */
function Arcfour(){this.i=0;this.j=0;this.S=new Array()}function ARC4init(d){var c,a,b;for(c=0;c<256;++c){this.S[c]=c}a=0;for(c=0;c<256;++c){a=(a+this.S[c]+d[c%d.length])&255;b=this.S[c];this.S[c]=this.S[a];this.S[a]=b}this.i=0;this.j=0}function ARC4next(){var a;this.i=(this.i+1)&255;this.j=(this.j+this.S[this.i])&255;a=this.S[this.i];this.S[this.i]=this.S[this.j];this.S[this.j]=a;return this.S[(a+this.S[this.i])&255]}Arcfour.prototype.init=ARC4init;Arcfour.prototype.next=ARC4next;function prng_newstate(){return new Arcfour()}var rng_psize=256;
/*! (c) Tom Wu | http://www-cs-students.stanford.edu/~tjw/jsbn/
 */
var rng_state;var rng_pool;var rng_pptr;function rng_seed_int(a){rng_pool[rng_pptr++]^=a&255;rng_pool[rng_pptr++]^=(a>>8)&255;rng_pool[rng_pptr++]^=(a>>16)&255;rng_pool[rng_pptr++]^=(a>>24)&255;if(rng_pptr>=rng_psize){rng_pptr-=rng_psize}}function rng_seed_time(){rng_seed_int(new Date().getTime())}if(rng_pool==null){rng_pool=new Array();rng_pptr=0;var t;if(window!==undefined&&(window.crypto!==undefined||window.msCrypto!==undefined)){var crypto=window.crypto||window.msCrypto;if(crypto.getRandomValues){var ua=new Uint8Array(32);crypto.getRandomValues(ua);for(t=0;t<32;++t){rng_pool[rng_pptr++]=ua[t]}}else{if(navigator.appName=="Netscape"&&navigator.appVersion<"5"){var z=window.crypto.random(32);for(t=0;t<z.length;++t){rng_pool[rng_pptr++]=z.charCodeAt(t)&255}}}}while(rng_pptr<rng_psize){t=Math.floor(65536*Math.random());rng_pool[rng_pptr++]=t>>>8;rng_pool[rng_pptr++]=t&255}rng_pptr=0;rng_seed_time()}function rng_get_byte(){if(rng_state==null){rng_seed_time();rng_state=prng_newstate();rng_state.init(rng_pool);for(rng_pptr=0;rng_pptr<rng_pool.length;++rng_pptr){rng_pool[rng_pptr]=0}rng_pptr=0}return rng_state.next()}function rng_get_bytes(b){var a;for(a=0;a<b.length;++a){b[a]=rng_get_byte()}}function SecureRandom(){}SecureRandom.prototype.nextBytes=rng_get_bytes;
/*! (c) Tom Wu | http://www-cs-students.stanford.edu/~tjw/jsbn/
 */
function ECFieldElementFp(b,a){this.x=a;this.q=b}function feFpEquals(a){if(a==this){return true}return(this.q.equals(a.q)&&this.x.equals(a.x))}function feFpToBigInteger(){return this.x}function feFpNegate(){return new ECFieldElementFp(this.q,this.x.negate().mod(this.q))}function feFpAdd(a){return new ECFieldElementFp(this.q,this.x.add(a.toBigInteger()).mod(this.q))}function feFpSubtract(a){return new ECFieldElementFp(this.q,this.x.subtract(a.toBigInteger()).mod(this.q))}function feFpMultiply(a){return new ECFieldElementFp(this.q,this.x.multiply(a.toBigInteger()).mod(this.q))}function feFpSquare(){return new ECFieldElementFp(this.q,this.x.square().mod(this.q))}function feFpDivide(a){return new ECFieldElementFp(this.q,this.x.multiply(a.toBigInteger().modInverse(this.q)).mod(this.q))}ECFieldElementFp.prototype.equals=feFpEquals;ECFieldElementFp.prototype.toBigInteger=feFpToBigInteger;ECFieldElementFp.prototype.negate=feFpNegate;ECFieldElementFp.prototype.add=feFpAdd;ECFieldElementFp.prototype.subtract=feFpSubtract;ECFieldElementFp.prototype.multiply=feFpMultiply;ECFieldElementFp.prototype.square=feFpSquare;ECFieldElementFp.prototype.divide=feFpDivide;ECFieldElementFp.prototype.sqrt=function(){return new ECFieldElementFp(this.q,this.x.sqrt().mod(this.q))};function ECPointFp(c,a,d,b){this.curve=c;this.x=a;this.y=d;if(b==null){this.z=BigInteger.ONE}else{this.z=b}this.zinv=null}function pointFpGetX(){if(this.zinv==null){this.zinv=this.z.modInverse(this.curve.q)}return this.curve.fromBigInteger(this.x.toBigInteger().multiply(this.zinv).mod(this.curve.q))}function pointFpGetY(){if(this.zinv==null){this.zinv=this.z.modInverse(this.curve.q)}return this.curve.fromBigInteger(this.y.toBigInteger().multiply(this.zinv).mod(this.curve.q))}function pointFpEquals(a){if(a==this){return true}if(this.isInfinity()){return a.isInfinity()}if(a.isInfinity()){return this.isInfinity()}var c,b;c=a.y.toBigInteger().multiply(this.z).subtract(this.y.toBigInteger().multiply(a.z)).mod(this.curve.q);if(!c.equals(BigInteger.ZERO)){return false}b=a.x.toBigInteger().multiply(this.z).subtract(this.x.toBigInteger().multiply(a.z)).mod(this.curve.q);return b.equals(BigInteger.ZERO)}function pointFpIsInfinity(){if((this.x==null)&&(this.y==null)){return true}return this.z.equals(BigInteger.ZERO)&&!this.y.toBigInteger().equals(BigInteger.ZERO)}function pointFpNegate(){return new ECPointFp(this.curve,this.x,this.y.negate(),this.z)}function pointFpAdd(l){if(this.isInfinity()){return l}if(l.isInfinity()){return this}var p=l.y.toBigInteger().multiply(this.z).subtract(this.y.toBigInteger().multiply(l.z)).mod(this.curve.q);var o=l.x.toBigInteger().multiply(this.z).subtract(this.x.toBigInteger().multiply(l.z)).mod(this.curve.q);if(BigInteger.ZERO.equals(o)){if(BigInteger.ZERO.equals(p)){return this.twice()}return this.curve.getInfinity()}var j=new BigInteger("3");var e=this.x.toBigInteger();var n=this.y.toBigInteger();var c=l.x.toBigInteger();var k=l.y.toBigInteger();var m=o.square();var i=m.multiply(o);var d=e.multiply(m);var g=p.square().multiply(this.z);var a=g.subtract(d.shiftLeft(1)).multiply(l.z).subtract(i).multiply(o).mod(this.curve.q);var h=d.multiply(j).multiply(p).subtract(n.multiply(i)).subtract(g.multiply(p)).multiply(l.z).add(p.multiply(i)).mod(this.curve.q);var f=i.multiply(this.z).multiply(l.z).mod(this.curve.q);return new ECPointFp(this.curve,this.curve.fromBigInteger(a),this.curve.fromBigInteger(h),f)}function pointFpTwice(){if(this.isInfinity()){return this}if(this.y.toBigInteger().signum()==0){return this.curve.getInfinity()}var g=new BigInteger("3");var c=this.x.toBigInteger();var h=this.y.toBigInteger();var e=h.multiply(this.z);var j=e.multiply(h).mod(this.curve.q);var i=this.curve.a.toBigInteger();var k=c.square().multiply(g);if(!BigInteger.ZERO.equals(i)){k=k.add(this.z.square().multiply(i))}k=k.mod(this.curve.q);var b=k.square().subtract(c.shiftLeft(3).multiply(j)).shiftLeft(1).multiply(e).mod(this.curve.q);var f=k.multiply(g).multiply(c).subtract(j.shiftLeft(1)).shiftLeft(2).multiply(j).subtract(k.square().multiply(k)).mod(this.curve.q);var d=e.square().multiply(e).shiftLeft(3).mod(this.curve.q);return new ECPointFp(this.curve,this.curve.fromBigInteger(b),this.curve.fromBigInteger(f),d)}function pointFpMultiply(d){if(this.isInfinity()){return this}if(d.signum()==0){return this.curve.getInfinity()}var m=d;var l=m.multiply(new BigInteger("3"));var b=this.negate();var j=this;var q=this.curve.q.subtract(d);var o=q.multiply(new BigInteger("3"));var c=new ECPointFp(this.curve,this.x,this.y);var a=c.negate();var g;for(g=l.bitLength()-2;g>0;--g){j=j.twice();var n=l.testBit(g);var f=m.testBit(g);if(n!=f){j=j.add(n?this:b)}}for(g=o.bitLength()-2;g>0;--g){c=c.twice();var p=o.testBit(g);var r=q.testBit(g);if(p!=r){c=c.add(p?c:a)}}return j}function pointFpMultiplyTwo(c,a,b){var d;if(c.bitLength()>b.bitLength()){d=c.bitLength()-1}else{d=b.bitLength()-1}var f=this.curve.getInfinity();var e=this.add(a);while(d>=0){f=f.twice();if(c.testBit(d)){if(b.testBit(d)){f=f.add(e)}else{f=f.add(this)}}else{if(b.testBit(d)){f=f.add(a)}}--d}return f}ECPointFp.prototype.getX=pointFpGetX;ECPointFp.prototype.getY=pointFpGetY;ECPointFp.prototype.equals=pointFpEquals;ECPointFp.prototype.isInfinity=pointFpIsInfinity;ECPointFp.prototype.negate=pointFpNegate;ECPointFp.prototype.add=pointFpAdd;ECPointFp.prototype.twice=pointFpTwice;ECPointFp.prototype.multiply=pointFpMultiply;ECPointFp.prototype.multiplyTwo=pointFpMultiplyTwo;function ECCurveFp(e,d,c){this.q=e;this.a=this.fromBigInteger(d);this.b=this.fromBigInteger(c);this.infinity=new ECPointFp(this,null,null)}function curveFpGetQ(){return this.q}function curveFpGetA(){return this.a}function curveFpGetB(){return this.b}function curveFpEquals(a){if(a==this){return true}return(this.q.equals(a.q)&&this.a.equals(a.a)&&this.b.equals(a.b))}function curveFpGetInfinity(){return this.infinity}function curveFpFromBigInteger(a){return new ECFieldElementFp(this.q,a)}function curveFpDecodePointHex(m){switch(parseInt(m.substr(0,2),16)){case 0:return this.infinity;case 2:case 3:var c=m.substr(0,2);var l=m.substr(2);var j=this.fromBigInteger(new BigInteger(k,16));var i=this.getA();var h=this.getB();var e=j.square().add(i).multiply(j).add(h);var g=e.sqrt();if(c=="03"){g=g.negate()}return new ECPointFp(this,j,g);case 4:case 6:case 7:var d=(m.length-2)/2;var k=m.substr(2,d);var f=m.substr(d+2,d);return new ECPointFp(this,this.fromBigInteger(new BigInteger(k,16)),this.fromBigInteger(new BigInteger(f,16)));default:return null}}ECCurveFp.prototype.getQ=curveFpGetQ;ECCurveFp.prototype.getA=curveFpGetA;ECCurveFp.prototype.getB=curveFpGetB;ECCurveFp.prototype.equals=curveFpEquals;ECCurveFp.prototype.getInfinity=curveFpGetInfinity;ECCurveFp.prototype.fromBigInteger=curveFpFromBigInteger;ECCurveFp.prototype.decodePointHex=curveFpDecodePointHex;
/*! (c) Stefan Thomas | https://github.com/bitcoinjs/bitcoinjs-lib
 */
ECFieldElementFp.prototype.getByteLength=function(){return Math.floor((this.toBigInteger().bitLength()+7)/8)};ECPointFp.prototype.getEncoded=function(c){var d=function(h,f){var g=h.toByteArrayUnsigned();if(f<g.length){g=g.slice(g.length-f)}else{while(f>g.length){g.unshift(0)}}return g};var a=this.getX().toBigInteger();var e=this.getY().toBigInteger();var b=d(a,32);if(c){if(e.isEven()){b.unshift(2)}else{b.unshift(3)}}else{b.unshift(4);b=b.concat(d(e,32))}return b};ECPointFp.decodeFrom=function(g,c){var f=c[0];var e=c.length-1;var d=c.slice(1,1+e/2);var b=c.slice(1+e/2,1+e);d.unshift(0);b.unshift(0);var a=new BigInteger(d);var h=new BigInteger(b);return new ECPointFp(g,g.fromBigInteger(a),g.fromBigInteger(h))};ECPointFp.decodeFromHex=function(g,c){var f=c.substr(0,2);var e=c.length-2;var d=c.substr(2,e/2);var b=c.substr(2+e/2,e/2);var a=new BigInteger(d,16);var h=new BigInteger(b,16);return new ECPointFp(g,g.fromBigInteger(a),g.fromBigInteger(h))};ECPointFp.prototype.add2D=function(c){if(this.isInfinity()){return c}if(c.isInfinity()){return this}if(this.x.equals(c.x)){if(this.y.equals(c.y)){return this.twice()}return this.curve.getInfinity()}var g=c.x.subtract(this.x);var e=c.y.subtract(this.y);var a=e.divide(g);var d=a.square().subtract(this.x).subtract(c.x);var f=a.multiply(this.x.subtract(d)).subtract(this.y);return new ECPointFp(this.curve,d,f)};ECPointFp.prototype.twice2D=function(){if(this.isInfinity()){return this}if(this.y.toBigInteger().signum()==0){return this.curve.getInfinity()}var b=this.curve.fromBigInteger(BigInteger.valueOf(2));var e=this.curve.fromBigInteger(BigInteger.valueOf(3));var a=this.x.square().multiply(e).add(this.curve.a).divide(this.y.multiply(b));var c=a.square().subtract(this.x.multiply(b));var d=a.multiply(this.x.subtract(c)).subtract(this.y);return new ECPointFp(this.curve,c,d)};ECPointFp.prototype.multiply2D=function(b){if(this.isInfinity()){return this}if(b.signum()==0){return this.curve.getInfinity()}var g=b;var f=g.multiply(new BigInteger("3"));var l=this.negate();var d=this;var c;for(c=f.bitLength()-2;c>0;--c){d=d.twice();var a=f.testBit(c);var j=g.testBit(c);if(a!=j){d=d.add2D(a?this:l)}}return d};ECPointFp.prototype.isOnCurve=function(){var d=this.getX().toBigInteger();var i=this.getY().toBigInteger();var f=this.curve.getA().toBigInteger();var c=this.curve.getB().toBigInteger();var h=this.curve.getQ();var e=i.multiply(i).mod(h);var g=d.multiply(d).multiply(d).add(f.multiply(d)).add(c).mod(h);return e.equals(g)};ECPointFp.prototype.toString=function(){return"("+this.getX().toBigInteger().toString()+","+this.getY().toBigInteger().toString()+")"};ECPointFp.prototype.validate=function(){var c=this.curve.getQ();if(this.isInfinity()){throw new Error("Point is at infinity.")}var a=this.getX().toBigInteger();var b=this.getY().toBigInteger();if(a.compareTo(BigInteger.ONE)<0||a.compareTo(c.subtract(BigInteger.ONE))>0){throw new Error("x coordinate out of bounds")}if(b.compareTo(BigInteger.ONE)<0||b.compareTo(c.subtract(BigInteger.ONE))>0){throw new Error("y coordinate out of bounds")}if(!this.isOnCurve()){throw new Error("Point is not on the curve.")}if(this.multiply(c).isInfinity()){throw new Error("Point is not a scalar multiple of G.")}return true};
/* asn1-1.0.26.js (c) 2013-2022 Kenji Urushima | kjur.github.io/jsrsasign/license
 */
/*
 * asn1.js - ASN.1 DER encoder classes
 *
 * Copyright (c) 2013-2022 Kenji Urushima (kenji.urushima@gmail.com)
 *
 * This software is licensed under the terms of the MIT License.
 * https://kjur.github.io/jsrsasign/license
 *
 * The above copyright and license notice shall be 
 * included in all copies or substantial portions of the Software.
 */

/**
 * @fileOverview
 * @name asn1-1.0.js
 * @author Kenji Urushima kenji.urushima@gmail.com
 * @version jsrsasign 10.5.22 asn1 1.0.26 (2022-May-24)
 * @since jsrsasign 2.1
 * @license <a href="https://kjur.github.io/jsrsasign/license/">MIT License</a>
 */

/** 
 * kjur's class library name space
 * <p>
 * This name space provides following name spaces:
 * <ul>
 * <li>{@link KJUR.asn1} - ASN.1 primitive hexadecimal encoder</li>
 * <li>{@link KJUR.asn1.x509} - ASN.1 structure for X.509 certificate and CRL</li>
 * <li>{@link KJUR.crypto} - Java Cryptographic Extension(JCE) style MessageDigest/Signature 
 * class and utilities</li>
 * </ul>
 * </p> 
 * NOTE: Please ignore method summary and document of this namespace. This caused by a bug of jsdoc2.
 * @name KJUR
 * @namespace kjur's class library name space
 */
if (typeof KJUR == "undefined" || !KJUR) KJUR = {};

/**
 * kjur's ASN.1 class library name space
 * <p>
 * This is ITU-T X.690 ASN.1 DER encoder class library and
 * class structure and methods is very similar to 
 * org.bouncycastle.asn1 package of 
 * well known BouncyCaslte Cryptography Library.
 * <h4>PROVIDING ASN.1 PRIMITIVES</h4>
 * Here are ASN.1 DER primitive classes.
 * <ul>
 * <li>0x01 {@link KJUR.asn1.DERBoolean}</li>
 * <li>0x02 {@link KJUR.asn1.DERInteger}</li>
 * <li>0x03 {@link KJUR.asn1.DERBitString}</li>
 * <li>0x04 {@link KJUR.asn1.DEROctetString}</li>
 * <li>0x05 {@link KJUR.asn1.DERNull}</li>
 * <li>0x06 {@link KJUR.asn1.DERObjectIdentifier}</li>
 * <li>0x0a {@link KJUR.asn1.DEREnumerated}</li>
 * <li>0x0c {@link KJUR.asn1.DERUTF8String}</li>
 * <li>0x12 {@link KJUR.asn1.DERNumericString}</li>
 * <li>0x13 {@link KJUR.asn1.DERPrintableString}</li>
 * <li>0x14 {@link KJUR.asn1.DERTeletexString}</li>
 * <li>0x16 {@link KJUR.asn1.DERIA5String}</li>
 * <li>0x17 {@link KJUR.asn1.DERUTCTime}</li>
 * <li>0x18 {@link KJUR.asn1.DERGeneralizedTime}</li>
 * <li>0x1a {@link KJUR.asn1.DERVisibleString}</li>
 * <li>0x1e {@link KJUR.asn1.DERBMPString}</li>
 * <li>0x30 {@link KJUR.asn1.DERSequence}</li>
 * <li>0x31 {@link KJUR.asn1.DERSet}</li>
 * </ul>
 * <h4>OTHER ASN.1 CLASSES</h4>
 * <ul>
 * <li>{@link KJUR.asn1.ASN1Object}</li>
 * <li>{@link KJUR.asn1.DERAbstractString}</li>
 * <li>{@link KJUR.asn1.DERAbstractTime}</li>
 * <li>{@link KJUR.asn1.DERAbstractStructured}</li>
 * <li>{@link KJUR.asn1.DERTaggedObject}</li>
 * </ul>
 * <h4>SUB NAME SPACES</h4>
 * <ul>
 * <li>{@link KJUR.asn1.cades} - CAdES long term signature format</li>
 * <li>{@link KJUR.asn1.cms} - Cryptographic Message Syntax</li>
 * <li>{@link KJUR.asn1.csr} - Certificate Signing Request (CSR/PKCS#10)</li>
 * <li>{@link KJUR.asn1.tsp} - RFC 3161 Timestamping Protocol Format</li>
 * <li>{@link KJUR.asn1.x509} - RFC 5280 X.509 certificate and CRL</li>
 * </ul>
 * </p>
 * NOTE: Please ignore method summary and document of this namespace. 
 * This caused by a bug of jsdoc2.
 * @name KJUR.asn1
 * @namespace
 */
if (typeof KJUR.asn1 == "undefined" || !KJUR.asn1) KJUR.asn1 = {};

/**
 * ASN1 utilities class
 * @name KJUR.asn1.ASN1Util
 * @class ASN1 utilities class
 * @since asn1 1.0.2
 */
KJUR.asn1.ASN1Util = new function() {
    this.integerToByteHex = function(i) {
        var h = i.toString(16);
        if ((h.length % 2) == 1) h = '0' + h;
        return h;
    };
    this.bigIntToMinTwosComplementsHex = function(bigIntegerValue) {
        var h = bigIntegerValue.toString(16);
        if (h.substr(0, 1) != '-') {
            if (h.length % 2 == 1) {
                h = '0' + h;
            } else {
                if (! h.match(/^[0-7]/)) {
                    h = '00' + h;
                }
            }
        } else {
            var hPos = h.substr(1);
            var xorLen = hPos.length;
            if (xorLen % 2 == 1) {
                xorLen += 1;
            } else {
                if (! h.match(/^[0-7]/)) {
                    xorLen += 2;
                }
            }
            var hMask = '';
            for (var i = 0; i < xorLen; i++) {
                hMask += 'f';
            }
            var biMask = new BigInteger(hMask, 16);
            var biNeg = biMask.xor(bigIntegerValue).add(BigInteger.ONE);
            h = biNeg.toString(16).replace(/^-/, '');
        }
        return h;
    };
    /**
     * get PEM string from hexadecimal data and header string
     * @name getPEMStringFromHex
     * @memberOf KJUR.asn1.ASN1Util
     * @function
     * @param {String} dataHex hexadecimal string of PEM body
     * @param {String} pemHeader PEM header string (ex. 'RSA PRIVATE KEY')
     * @return {String} PEM formatted string of input data
     * @description
     * This method converts a hexadecimal string to a PEM string with
     * a specified header. Its line break will be CRLF("\r\n").
     * @example
     * var pem  = KJUR.asn1.ASN1Util.getPEMStringFromHex('616161', 'RSA PRIVATE KEY');
     * // value of pem will be:
     * -----BEGIN PRIVATE KEY-----
     * YWFh
     * -----END PRIVATE KEY-----
     */
    this.getPEMStringFromHex = function(dataHex, pemHeader) {
	return hextopem(dataHex, pemHeader);
    };

    /**
     * generate ASN1Object specifed by JSON parameters
     * @name newObject
     * @memberOf KJUR.asn1.ASN1Util
     * @function
     * @param {Array} param JSON parameter to generate ASN1Object
     * @return {KJUR.asn1.ASN1Object} generated object
     * @since asn1 1.0.3
     * @description
     * generate any ASN1Object specified by JSON param
     * including ASN.1 primitive or structured.
     * Generally 'param' can be described as follows:
     * <blockquote>
     * {TYPE-OF-ASNOBJ: ASN1OBJ-PARAMETER}
     * </blockquote>
     * 'TYPE-OF-ASN1OBJ' can be one of following symbols:
     * <ul>
     * <li>'bool' - {@link KJUR.asn1.DERBoolean}</li>
     * <li>'int' - {@link KJUR.asn1.DERInteger}</li>
     * <li>'bitstr' - {@link KJUR.asn1.DERBitString}</li>
     * <li>'octstr' - {@link KJUR.asn1.DEROctetString}</li>
     * <li>'null' - {@link KJUR.asn1.DERNull}</li>
     * <li>'oid' - {@link KJUR.asn1.DERObjectIdentifier}</li>
     * <li>'enum' - {@link KJUR.asn1.DEREnumerated}</li>
     * <li>'utf8str' - {@link KJUR.asn1.DERUTF8String}</li>
     * <li>'numstr' - {@link KJUR.asn1.DERNumericString}</li>
     * <li>'prnstr' - {@link KJUR.asn1.DERPrintableString}</li>
     * <li>'telstr' - {@link KJUR.asn1.DERTeletexString}</li>
     * <li>'ia5str' - {@link KJUR.asn1.DERIA5String}</li>
     * <li>'utctime' - {@link KJUR.asn1.DERUTCTime}</li>
     * <li>'gentime' - {@link KJUR.asn1.DERGeneralizedTime}</li>
     * <li>'visstr' - {@link KJUR.asn1.DERVisibleString}</li>
     * <li>'bmpstr' - {@link KJUR.asn1.DERBMPString}</li>
     * <li>'seq' - {@link KJUR.asn1.DERSequence}</li>
     * <li>'set' - {@link KJUR.asn1.DERSet}</li>
     * <li>'tag' - {@link KJUR.asn1.DERTaggedObject}</li>
     * <li>'asn1' - {@link KJUR.asn1.ASN1Object}</li>
     * </ul>
     * <br/>
     * NOTE: Structured object such as SEQUENCE or SET can conclude
     * ASN1Object as well as JSON parameters since jsrsasign 9.0.0.
     *
     * @example
     * newObject({'prnstr': 'aaa'});
     * newObject({'seq': [{'int': 3}, {'prnstr': 'aaa'}]})
     * newObject({seq: [{int: 3}, new DERInteger({int: 3})]}) // mixed
     * // ASN.1 Tagged Object
     * newObject({'tag': {'tag': 'a1', 
     *                    'explicit': true,
     *                    'obj': {'seq': [{'int': 3}, {'prnstr': 'aaa'}]}}});
     * // more simple representation of ASN.1 Tagged Object
     * newObject({'tag': ['a1',
     *                    true,
     *                    {'seq': [
     *                      {'int': 3}, 
     *                      {'prnstr': 'aaa'}]}
     *                   ]});
     */
    this.newObject = function(param) {
	var _KJUR = KJUR,
	    _KJUR_asn1 = _KJUR.asn1,
	    _ASN1Object = _KJUR_asn1.ASN1Object,
	    _DERBoolean = _KJUR_asn1.DERBoolean,
	    _DERInteger = _KJUR_asn1.DERInteger,
	    _DERBitString = _KJUR_asn1.DERBitString,
	    _DEROctetString = _KJUR_asn1.DEROctetString,
	    _DERNull = _KJUR_asn1.DERNull,
	    _DERObjectIdentifier = _KJUR_asn1.DERObjectIdentifier,
	    _DEREnumerated = _KJUR_asn1.DEREnumerated,
	    _DERUTF8String = _KJUR_asn1.DERUTF8String,
	    _DERNumericString = _KJUR_asn1.DERNumericString,
	    _DERPrintableString = _KJUR_asn1.DERPrintableString,
	    _DERTeletexString = _KJUR_asn1.DERTeletexString,
	    _DERIA5String = _KJUR_asn1.DERIA5String,
	    _DERUTCTime = _KJUR_asn1.DERUTCTime,
	    _DERGeneralizedTime = _KJUR_asn1.DERGeneralizedTime,
	    _DERVisibleString = _KJUR_asn1.DERVisibleString,
	    _DERBMPString = _KJUR_asn1.DERBMPString,
	    _DERSequence = _KJUR_asn1.DERSequence,
	    _DERSet = _KJUR_asn1.DERSet,
	    _DERTaggedObject = _KJUR_asn1.DERTaggedObject,
	    _newObject = _KJUR_asn1.ASN1Util.newObject;

	if (param instanceof _KJUR_asn1.ASN1Object) return param;

        var keys = Object.keys(param);
        if (keys.length != 1)
            throw new Error("key of param shall be only one.");
        var key = keys[0];

        if (":asn1:bool:int:bitstr:octstr:null:oid:enum:utf8str:numstr:prnstr:telstr:ia5str:utctime:gentime:visstr:bmpstr:seq:set:tag:".indexOf(":" + key + ":") == -1)
            throw new Error("undefined key: " + key);

        if (key == "bool")    return new _DERBoolean(param[key]);
        if (key == "int")     return new _DERInteger(param[key]);
        if (key == "bitstr")  return new _DERBitString(param[key]);
        if (key == "octstr")  return new _DEROctetString(param[key]);
        if (key == "null")    return new _DERNull(param[key]);
        if (key == "oid")     return new _DERObjectIdentifier(param[key]);
        if (key == "enum")    return new _DEREnumerated(param[key]);
        if (key == "utf8str") return new _DERUTF8String(param[key]);
        if (key == "numstr")  return new _DERNumericString(param[key]);
        if (key == "prnstr")  return new _DERPrintableString(param[key]);
        if (key == "telstr")  return new _DERTeletexString(param[key]);
        if (key == "ia5str")  return new _DERIA5String(param[key]);
        if (key == "utctime") return new _DERUTCTime(param[key]);
        if (key == "gentime") return new _DERGeneralizedTime(param[key]);
        if (key == "visstr")  return new _DERVisibleString(param[key]);
        if (key == "bmpstr")  return new _DERBMPString(param[key]);
        if (key == "asn1")    return new _ASN1Object(param[key]);

        if (key == "seq") {
            var paramList = param[key];
            var a = [];
            for (var i = 0; i < paramList.length; i++) {
                var asn1Obj = _newObject(paramList[i]);
                a.push(asn1Obj);
            }
            return new _DERSequence({'array': a});
        }

        if (key == "set") {
            var paramList = param[key];
            var a = [];
            for (var i = 0; i < paramList.length; i++) {
                var asn1Obj = _newObject(paramList[i]);
                a.push(asn1Obj);
            }
            return new _DERSet({'array': a});
        }

        if (key == "tag") {
            var tagParam = param[key];
            if (Object.prototype.toString.call(tagParam) === '[object Array]' &&
                tagParam.length == 3) {
                var obj = _newObject(tagParam[2]);
                return new _DERTaggedObject({tag: tagParam[0],
					     explicit: tagParam[1],
					     obj: obj});
            } else {
		return new _DERTaggedObject(tagParam);
            }
        }
    };

    /**
     * get encoded hexadecimal string of ASN1Object specifed by JSON parameters
     * @name jsonToASN1HEX
     * @memberOf KJUR.asn1.ASN1Util
     * @function
     * @param {Array} param JSON parameter to generate ASN1Object
     * @return hexadecimal string of ASN1Object
     * @since asn1 1.0.4
     * @description
     * As for ASN.1 object representation of JSON object,
     * please see {@link newObject}.
     * @example
     * jsonToASN1HEX({'prnstr': 'aaa'}); 
     */
    this.jsonToASN1HEX = function(param) {
        var asn1Obj = this.newObject(param);
        return asn1Obj.tohex();
    };
};

/**
 * get dot noted oid number string from hexadecimal value of OID
 * @name oidHexToInt
 * @memberOf KJUR.asn1.ASN1Util
 * @function
 * @param {String} hex hexadecimal value of object identifier
 * @return {String} dot noted string of object identifier
 * @since jsrsasign 4.8.3 asn1 1.0.7
 * @description
 * This static method converts from hexadecimal string representation of 
 * ASN.1 value of object identifier to oid number string.
 * @example
 * KJUR.asn1.ASN1Util.oidHexToInt('550406') &rarr; "2.5.4.6"
 */
KJUR.asn1.ASN1Util.oidHexToInt = function(hex) {
    var s = "";
    var i01 = parseInt(hex.substr(0, 2), 16);
    var i0 = Math.floor(i01 / 40);
    var i1 = i01 % 40;
    var s = i0 + "." + i1;

    var binbuf = "";
    for (var i = 2; i < hex.length; i += 2) {
	var value = parseInt(hex.substr(i, 2), 16);
        var bin = ("00000000" + value.toString(2)).slice(- 8);
	binbuf = binbuf + bin.substr(1, 7);
	if (bin.substr(0, 1) == "0") {
	    var bi = new BigInteger(binbuf, 2);
	    s = s + "." + bi.toString(10);
	    binbuf = "";
	}
    };

    return s;
};

/**
 * get hexadecimal value of object identifier from dot noted oid value (DEPRECATED)
 * @name oidIntToHex
 * @memberOf KJUR.asn1.ASN1Util
 * @function
 * @param {String} oidString dot noted string of object identifier
 * @return {String} hexadecimal value of object identifier
 * @since jsrsasign 4.8.3 asn1 1.0.7
 * @see {@link ASN1HEX.hextooidstr}
 * @deprecated from jsrsasign 10.0.6. please use {@link oidtohex}
 *
 * @description
 * This static method converts from object identifier value string.
 * to hexadecimal string representation of it.
 * {@link ASN1HEX.hextooidstr} is a reverse function of this.
 * @example
 * KJUR.asn1.ASN1Util.oidIntToHex("2.5.4.6") &rarr; "550406"
 */
KJUR.asn1.ASN1Util.oidIntToHex = function(oidString) {
    var itox = function(i) {
        var h = i.toString(16);
        if (h.length == 1) h = '0' + h;
        return h;
    };

    var roidtox = function(roid) {
        var h = '';
        var bi = new BigInteger(roid, 10);
        var b = bi.toString(2);
        var padLen = 7 - b.length % 7;
        if (padLen == 7) padLen = 0;
        var bPad = '';
        for (var i = 0; i < padLen; i++) bPad += '0';
        b = bPad + b;
        for (var i = 0; i < b.length - 1; i += 7) {
            var b8 = b.substr(i, 7);
            if (i != b.length - 7) b8 = '1' + b8;
            h += itox(parseInt(b8, 2));
        }
        return h;
    };
    
    if (! oidString.match(/^[0-9.]+$/)) {
        throw "malformed oid string: " + oidString;
    }
    var h = '';
    var a = oidString.split('.');
    var i0 = parseInt(a[0]) * 40 + parseInt(a[1]);
    h += itox(i0);
    a.splice(0, 2);
    for (var i = 0; i < a.length; i++) {
        h += roidtox(a[i]);
    }
    return h;
};


// ********************************************************************
//  Abstract ASN.1 Classes
// ********************************************************************

// ********************************************************************

/**
 * base class for ASN.1 DER encoder object<br/>
 * @name KJUR.asn1.ASN1Object
 * @class base class for ASN.1 DER encoder object
 * @param {Array} params JSON object parameter for constructor
 * @property {Boolean} isModified flag whether internal data was changed
 * @property {Array} params JSON object parameter for ASN.1 encode
 * @property {String} hTLV hexadecimal string of ASN.1 TLV
 * @property {String} hT hexadecimal string of ASN.1 TLV tag(T)
 * @property {String} hL hexadecimal string of ASN.1 TLV length(L)
 * @property {String} hV hexadecimal string of ASN.1 TLV value(V)
 *
 * @description
 * This class is ASN.1 DER object encode base class.
 * 
 * @example
 * new KJUR.asn1.ASN1Object({tlv: "030101"})
 */
KJUR.asn1.ASN1Object = function(params) {
    var isModified = true;
    var hTLV = null;
    var hT = '00';
    var hL = '00';
    var hV = '';
    this.params = null;

    /**
     * get hexadecimal ASN.1 TLV length(L) bytes from TLV value(V)<br/>
     * @name getLengthHexFromValue
     * @memberOf KJUR.asn1.ASN1Object#
     * @function
     * @return {String} hexadecimal string of ASN.1 TLV length(L)
     */
    this.getLengthHexFromValue = function() {
        if (typeof this.hV == "undefined" || this.hV == null) {
            throw new Error("this.hV is null or undefined");
        }
        if (this.hV.length % 2 == 1) {
            throw new Error("value hex must be even length: n=" +
			    hV.length + ",v=" + this.hV);
        }
        var n = this.hV.length / 2;
        var hN = n.toString(16);
        if (hN.length % 2 == 1) {
            hN = "0" + hN;
        }
        if (n < 128) {
            return hN;
        } else {
            var hNlen = hN.length / 2;
            if (hNlen > 15) {
                throw new Error("ASN.1 length too long to represent by 8x: n = "
				+ n.toString(16));
            }
            var head = 128 + hNlen;
            return head.toString(16) + hN;
        }
    };

    /**
     * get hexadecimal string of ASN.1 TLV bytes<br/>
     * @name tohex
     * @memberOf KJUR.asn1.ASN1Object#
     * @function
     * @return {String} hexadecimal string of ASN.1 TLV
     * @since jsrsasign 10.5.16 asn1 1.0.24
     * @see KJUR.asn1.ASN1Object#getEncodedHex
     * @example
     * ...ASN1ObjectInstance.tohex() &rarr; "3003020101"
     */
    this.tohex = function() {
        if (this.hTLV == null || this.isModified) {
            this.hV = this.getFreshValueHex();
            this.hL = this.getLengthHexFromValue();
            this.hTLV = this.hT + this.hL + this.hV;
            this.isModified = false;
            //alert("first time: " + this.hTLV);
        }
        return this.hTLV;
    };

    /**
     * get hexadecimal string of ASN.1 TLV bytes (DEPRECATED)<br/>
     * @name getEncodedHex
     * @memberOf KJUR.asn1.ASN1Object#
     * @function
     * @return {String} hexadecimal string of ASN.1 TLV
     * @deprecated since jsrsasign 10.5.16 please use {@link KJUR.asn1.ASN1Object#tohex}
     */
    this.getEncodedHex = function() { return this.tohex(); };

    /**
     * get hexadecimal string of ASN.1 TLV value(V) bytes
     * @name getValueHex
     * @memberOf KJUR.asn1.ASN1Object#
     * @function
     * @return {String} hexadecimal string of ASN.1 TLV value(V) bytes
     */
    this.getValueHex = function() {
        this.tohex();
        return this.hV;
    }

    this.getFreshValueHex = function() {
        return '';
    };

    this.setByParam = function(params) {
	this.params = params;
    };

    if (params != undefined) {
	if (params.tlv != undefined) {
	    this.hTLV = params.tlv;
	    this.isModified = false;
	}
    }
};

// == BEGIN DERAbstractString ================================================
/**
 * base class for ASN.1 DER string classes
 * @name KJUR.asn1.DERAbstractString
 * @class base class for ASN.1 DER string classes
 * @param {Array} params associative array of parameters (ex. {'str': 'aaa'})
 * @property {String} s internal string of value
 * @extends KJUR.asn1.ASN1Object
 * @description
 * <br/>
 * As for argument 'params' for constructor, you can specify one of
 * following properties:
 * <ul>
 * <li>str - specify initial ASN.1 value(V) by a string</li>
 * <li>hex - specify initial ASN.1 value(V) by a hexadecimal string</li>
 * </ul>
 * NOTE: 'params' can be omitted.
 */
KJUR.asn1.DERAbstractString = function(params) {
    KJUR.asn1.DERAbstractString.superclass.constructor.call(this);
    var s = null;
    var hV = null;

    /**
     * get string value of this string object
     * @name getString
     * @memberOf KJUR.asn1.DERAbstractString#
     * @function
     * @return {String} string value of this string object
     */
    this.getString = function() {
        return this.s;
    };

    /**
     * set value by a string
     * @name setString
     * @memberOf KJUR.asn1.DERAbstractString#
     * @function
     * @param {String} newS value by a string to set
     * @description
     * This method set value by string. <br/>
     * NOTE: This method assumes that the argument string is
     * UTF-8 encoded even though ASN.1 primitive 
     * such as IA5String or PrintableString doesn't
     * support all of UTF-8 characters.
     * @example
     * o = new KJUR.asn1.DERIA5String();
     * o.setString("abc");
     * o.setString("あいう");
     */
    this.setString = function(newS) {
        this.hTLV = null;
        this.isModified = true;
        this.s = newS;
        this.hV = utf8tohex(this.s).toLowerCase();
    };

    /**
     * set value by a hexadecimal string
     * @name setStringHex
     * @memberOf KJUR.asn1.DERAbstractString#
     * @function
     * @param {String} newHexString value by a hexadecimal string to set
     */
    this.setStringHex = function(newHexString) {
        this.hTLV = null;
        this.isModified = true;
        this.s = null;
        this.hV = newHexString;
    };

    this.getFreshValueHex = function() {
        return this.hV;
    };

    if (typeof params != "undefined") {
        if (typeof params == "string") {
            this.setString(params);
        } else if (typeof params['str'] != "undefined") {
            this.setString(params['str']);
        } else if (typeof params['hex'] != "undefined") {
            this.setStringHex(params['hex']);
        }
    }
};
extendClass(KJUR.asn1.DERAbstractString, KJUR.asn1.ASN1Object);
// == END   DERAbstractString ================================================

// == BEGIN DERAbstractTime ==================================================
/**
 * base class for ASN.1 DER Generalized/UTCTime class
 * @name KJUR.asn1.DERAbstractTime
 * @class base class for ASN.1 DER Generalized/UTCTime class
 * @param {Array} params associative array of parameters (ex. {'str': '130430235959Z'})
 * @extends KJUR.asn1.ASN1Object
 * @description
 * @see KJUR.asn1.ASN1Object - superclass
 * @see KJUR.asn1.DERGeneralizedTime
 * @see KJUR.asn1.DERUTCTime
 * @see KJUR.asn1.x509.Time
 */
KJUR.asn1.DERAbstractTime = function(params) {
    KJUR.asn1.DERAbstractTime.superclass.constructor.call(this);
    var s = null;
    var date = null;

    // --- PRIVATE METHODS --------------------
    this.localDateToUTC = function(d) {
        var utc = d.getTime() + (d.getTimezoneOffset() * 60000);
        var utcDate = new Date(utc);
        return utcDate;
    };

    /*
     * format date string by Data object
     * @name formatDate
     * @memberOf KJUR.asn1.AbstractTime;
     * @param {Date} dateObject 
     * @param {string} type 'utc' or 'gen'
     * @param {boolean} withMillis flag for with millisections or not
     * @description
     * 'withMillis' flag is supported from asn1 1.0.6.
     */
    this.formatDate = function(dateObject, type, withMillis) {
        var pad = this.zeroPadding;
        var d = this.localDateToUTC(dateObject);
        var year = String(d.getFullYear());
        if (type == 'utc') year = year.substr(2, 2);
        var month = pad(String(d.getMonth() + 1), 2);
        var day = pad(String(d.getDate()), 2);
        var hour = pad(String(d.getHours()), 2);
        var min = pad(String(d.getMinutes()), 2);
        var sec = pad(String(d.getSeconds()), 2);
        var s = year + month + day + hour + min + sec;
        if (withMillis === true) {
            var millis = d.getMilliseconds();
            if (millis != 0) {
                var sMillis = pad(String(millis), 3);
                sMillis = sMillis.replace(/[0]+$/, "");
                s = s + "." + sMillis;
            }
        }
        return s + "Z";
    };

    this.zeroPadding = function(s, len) {
        if (s.length >= len) return s;
        return new Array(len - s.length + 1).join('0') + s;
    };

    // --- PUBLIC METHODS --------------------

    /**
     * set parameter of time
     * @name setByParam
     * @memberOf KJUR.asn1.DERAbstractTime#
     * @function
     * @param {Object} params JSON object, Date object or string of time
     * @since jsrsasign 10.4.1 asn1 1.0.22
     *
     * NOTE: If a member "millis" has a value "true",
     * a fraction of second will be specified for this object. 
     * This default is "false".
     *
     * @example
     * d1 = new KJUR.asn1.DERGeneralizedTime();
     * d1.setByParam("20210930235959.123Z");
     * d1.setByParam({str: "20210930235959.123Z"});
     *
     * d1.setByParam(new Date("2013/12/31 23:59:59.12"));
     * date1 = new Date(Date.UTC(2021,8,31,23,59,59,123));
     * d1.setByParam(date1);
     * d1.setByParam({date: date1});
     * d1.setByParam({date: date1, millis: true});
     */
    this.setByParam = function(params) {
	this.hV = null;
	this.hTLV = null;
	this.params = params;
    };

    /**
     * get string value of this string object (DEPRECATED)
     * @name getString
     * @memberOf KJUR.asn1.DERAbstractTime#
     * @function
     * @return {String} string value of this time object
     * @deprecated from jsrsasign 10.4.1 asn1 1.0.22.
     */
    this.getString = function() {
        return undefined;
    };

    /**
     * set value by a string (DEPRECATED)
     * @name setString
     * @memberOf KJUR.asn1.DERAbstractTime#
     * @function
     * @param {String} newS value by a string to set such like "130430235959Z"
     * @deprecated from jsrsasign 10.4.1 asn1 1.0.22.
     */
    this.setString = function(newS) {
        this.hTLV = null;
        this.isModified = true;
	if (this.params == undefined) this.params = {};
	this.params.str = newS;
    };

    /**
     * set value by a Date object<br/>
     * @name setByDate
     * @memberOf KJUR.asn1.DERAbstractTime#
     * @function
     * @param {Date} dateObject Date object to set ASN.1 value(V)
     * @since jsrsasign 10.4.1 asn1 1.0.22
     *
     * @example
     * o = new KJUR.asn1.DERUTCTime();
     * o.setByDate(new Date("2016/12/31 23:59:59.12"));
     * // 2015-Jan-31 23:59:59.12
     * o.setByDate(new Date(Date.UTC(2015, 0, 31, 23, 59, 59, 0)));
     */
    this.setByDate = function(dateObject) {
        this.hTLV = null;
        this.isModified = true;
	if (this.params == undefined) this.params = {};
	this.params.date = dateObject;
    };

    /**
     * set value by a Date object
     * @name setByDateValue
     * @memberOf KJUR.asn1.DERAbstractTime#
     * @function
     * @param {Integer} year year of date (ex. 2013)
     * @param {Integer} month month of date between 1 and 12 (ex. 12)
     * @param {Integer} day day of month
     * @param {Integer} hour hours of date
     * @param {Integer} min minutes of date
     * @param {Integer} sec seconds of date
     */
    this.setByDateValue = function(year, month, day, hour, min, sec) {
        var dateObject = new Date(Date.UTC(year, month - 1, day, 
					   hour, min, sec, 0));
        this.setByDate(dateObject);
    };

    this.getFreshValueHex = function() {
        return this.hV;
    };
};
extendClass(KJUR.asn1.DERAbstractTime, KJUR.asn1.ASN1Object);
// == END   DERAbstractTime ==================================================

// == BEGIN DERAbstractStructured ============================================
/**
 * base class for ASN.1 DER structured class
 * @name KJUR.asn1.DERAbstractStructured
 * @class base class for ASN.1 DER structured class
 * @property {Array} asn1Array internal array of ASN1Object
 * @extends KJUR.asn1.ASN1Object
 * @description
 * @see KJUR.asn1.ASN1Object - superclass
 */
KJUR.asn1.DERAbstractStructured = function(params) {
    KJUR.asn1.DERAbstractString.superclass.constructor.call(this);
    var asn1Array = null;

    /**
     * set value by array of ASN1Object
     * @name setByASN1ObjectArray
     * @memberOf KJUR.asn1.DERAbstractStructured#
     * @function
     * @param {array} asn1ObjectArray array of ASN1Object to set
     */
    this.setByASN1ObjectArray = function(asn1ObjectArray) {
        this.hTLV = null;
        this.isModified = true;
        this.asn1Array = asn1ObjectArray;
    };

    /**
     * append an ASN1Object to internal array
     * @name appendASN1Object
     * @memberOf KJUR.asn1.DERAbstractStructured#
     * @function
     * @param {ASN1Object} asn1Object to add
     */
    this.appendASN1Object = function(asn1Object) {
        this.hTLV = null;
        this.isModified = true;
        this.asn1Array.push(asn1Object);
    };

    this.asn1Array = new Array();
    if (typeof params != "undefined") {
        if (typeof params['array'] != "undefined") {
            this.asn1Array = params['array'];
        }
    }
};
extendClass(KJUR.asn1.DERAbstractStructured, KJUR.asn1.ASN1Object);


// ********************************************************************
//  ASN.1 Object Classes
// ********************************************************************

// ********************************************************************
/**
 * class for ASN.1 DER Boolean
 * @name KJUR.asn1.DERBoolean
 * @class class for ASN.1 DER Boolean
 * @extends KJUR.asn1.ASN1Object
 * @see KJUR.asn1.ASN1Object - superclass
 * @description
 * In ASN.1 DER, DER Boolean "false" shall be omitted.
 * However this supports boolean false for future BER support.
 * @example
 * new KJUR.asn1.DERBoolean(true)
 * new KJUR.asn1.DERBoolean(false)
 */
KJUR.asn1.DERBoolean = function(params) {
    KJUR.asn1.DERBoolean.superclass.constructor.call(this);
    this.hT = "01";
    if (params == false)
	this.hTLV = "010100";
    else 
	this.hTLV = "0101ff";
};
extendClass(KJUR.asn1.DERBoolean, KJUR.asn1.ASN1Object);

// ********************************************************************
/**
 * class for ASN.1 DER Integer
 * @name KJUR.asn1.DERInteger
 * @class class for ASN.1 DER Integer
 * @extends KJUR.asn1.ASN1Object
 * @description
 * <br/>
 * As for argument 'params' for constructor, you can specify one of
 * following properties:
 * <ul>
 * <li>int - specify initial ASN.1 value(V) by integer value</li>
 * <li>bigint - specify initial ASN.1 value(V) by BigInteger object</li>
 * <li>hex - specify initial ASN.1 value(V) by a hexadecimal string</li>
 * </ul>
 * NOTE: 'params' can be omitted.
 */
KJUR.asn1.DERInteger = function(params) {
    KJUR.asn1.DERInteger.superclass.constructor.call(this);
    this.hT = "02";

    /**
     * set value by Tom Wu's BigInteger object
     * @name setByBigInteger
     * @memberOf KJUR.asn1.DERInteger#
     * @function
     * @param {BigInteger} bigIntegerValue to set
     */
    this.setByBigInteger = function(bigIntegerValue) {
        this.hTLV = null;
        this.isModified = true;
        this.hV = KJUR.asn1.ASN1Util.bigIntToMinTwosComplementsHex(bigIntegerValue);
    };

    /**
     * set value by integer value
     * @name setByInteger
     * @memberOf KJUR.asn1.DERInteger
     * @function
     * @param {Integer} integer value to set
     */
    this.setByInteger = function(intValue) {
        var bi = new BigInteger(String(intValue), 10);
        this.setByBigInteger(bi);
    };

    /**
     * set value by integer value
     * @name setValueHex
     * @memberOf KJUR.asn1.DERInteger#
     * @function
     * @param {String} hexadecimal string of integer value
     * @description
     * <br/>
     * NOTE: Value shall be represented by minimum octet length of
     * two's complement representation.
     * @example
     * new KJUR.asn1.DERInteger(123);
     * new KJUR.asn1.DERInteger({'int': 123});
     * new KJUR.asn1.DERInteger({'hex': '1fad'});
     */
    this.setValueHex = function(newHexString) {
        this.hV = newHexString;
    };

    this.getFreshValueHex = function() {
        return this.hV;
    };

    if (typeof params != "undefined") {
        if (typeof params['bigint'] != "undefined") {
            this.setByBigInteger(params['bigint']);
        } else if (typeof params['int'] != "undefined") {
            this.setByInteger(params['int']);
        } else if (typeof params == "number") {
            this.setByInteger(params);
        } else if (typeof params['hex'] != "undefined") {
            this.setValueHex(params['hex']);
        }
    }
};
extendClass(KJUR.asn1.DERInteger, KJUR.asn1.ASN1Object);

// ********************************************************************
/**
 * class for ASN.1 DER encoded BitString primitive
 * @name KJUR.asn1.DERBitString
 * @class class for ASN.1 DER encoded BitString primitive
 * @extends KJUR.asn1.ASN1Object
 * @description 
 * <br/>
 * As for argument 'params' for constructor, you can specify one of
 * following properties:
 * <ul>
 * <li>bin - specify binary string (ex. '10111')</li>
 * <li>array - specify array of boolean (ex. [true,false,true,true])</li>
 * <li>hex - specify hexadecimal string of ASN.1 value(V) including unused bits</li>
 * <li>obj - specify {@link KJUR.asn1.ASN1Util.newObject} 
 * argument for "BitString encapsulates" structure.</li>
 * </ul>
 * NOTE1: 'params' can be omitted.<br/>
 * NOTE2: 'obj' parameter have been supported since
 * asn1 1.0.11, jsrsasign 6.1.1 (2016-Sep-25).<br/>
 *
 * @example
 * // default constructor
 * o = new KJUR.asn1.DERBitString();
 * // initialize with binary string
 * o = new KJUR.asn1.DERBitString({bin: "1011"});
 * // initialize with boolean array
 * o = new KJUR.asn1.DERBitString({array: [true,false,true,true]});
 * // initialize with hexadecimal string (04 is unused bits)
 * o = new KJUR.asn1.DERBitString({hex: "04bac0"});
 * // initialize with ASN1Util.newObject argument for encapsulated
 * o = new KJUR.asn1.DERBitString({obj: {seq: [{int: 3}, {prnstr: 'aaa'}]}});
 * // above generates a ASN.1 data like this:
 * // BIT STRING, encapsulates {
 * //   SEQUENCE {
 * //     INTEGER 3
 * //     PrintableString 'aaa'
 * //     }
 * //   } 
 */
KJUR.asn1.DERBitString = function(params) {
    if (params !== undefined && typeof params.obj !== "undefined") {
	var o = KJUR.asn1.ASN1Util.newObject(params.obj);
	params.hex = "00" + o.tohex();
    }
    KJUR.asn1.DERBitString.superclass.constructor.call(this);
    this.hT = "03";

    /**
     * set ASN.1 value(V) by a hexadecimal string including unused bits
     * @name setHexValueIncludingUnusedBits
     * @memberOf KJUR.asn1.DERBitString#
     * @function
     * @param {String} newHexStringIncludingUnusedBits
     */
    this.setHexValueIncludingUnusedBits = function(newHexStringIncludingUnusedBits) {
        this.hTLV = null;
        this.isModified = true;
        this.hV = newHexStringIncludingUnusedBits;
    };

    /**
     * set ASN.1 value(V) by unused bit and hexadecimal string of value
     * @name setUnusedBitsAndHexValue
     * @memberOf KJUR.asn1.DERBitString#
     * @function
     * @param {Integer} unusedBits
     * @param {String} hValue
     */
    this.setUnusedBitsAndHexValue = function(unusedBits, hValue) {
        if (unusedBits < 0 || 7 < unusedBits) {
            throw "unused bits shall be from 0 to 7: u = " + unusedBits;
        }
        var hUnusedBits = "0" + unusedBits;
        this.hTLV = null;
        this.isModified = true;
        this.hV = hUnusedBits + hValue;
    };

    /**
     * set ASN.1 DER BitString by binary string<br/>
     * @name setByBinaryString
     * @memberOf KJUR.asn1.DERBitString#
     * @function
     * @param {String} binaryString binary value string (i.e. '10111')
     * @description
     * Its unused bits will be calculated automatically by length of 
     * 'binaryValue'. <br/>
     * NOTE: Leading zeros '0' will be ignored.
     * @example
     * o = new KJUR.asn1.DERBitString();
     * o.setByBinaryString("1011");
     * o.setByBinaryString("001"); // leading zeros ignored
     */
    this.setByBinaryString = function(binaryString) {
        binaryString = binaryString.replace(/0+$/, '');
        var unusedBits = 8 - binaryString.length % 8;
        if (unusedBits == 8) unusedBits = 0;
	
	binaryString += "0000000".substr(0, unusedBits);

        var h = '';
        for (var i = 0; i < binaryString.length - 1; i += 8) {
            var b = binaryString.substr(i, 8);
            var x = parseInt(b, 2).toString(16);
            if (x.length == 1) x = '0' + x;
            h += x;  
        }
        this.hTLV = null;
        this.isModified = true;
        this.hV = '0' + unusedBits + h;
    };

    /**
     * set ASN.1 TLV value(V) by an array of boolean<br/>
     * @name setByBooleanArray
     * @memberOf KJUR.asn1.DERBitString#
     * @function
     * @param {array} booleanArray array of boolean (ex. [true, false, true])
     * @description
     * NOTE: Trailing falses will be ignored in the ASN.1 DER Object.
     * @example
     * o = new KJUR.asn1.DERBitString();
     * o.setByBooleanArray([false, true, false, true, true]);
     */
    this.setByBooleanArray = function(booleanArray) {
        var s = '';
        for (var i = 0; i < booleanArray.length; i++) {
            if (booleanArray[i] == true) {
                s += '1';
            } else {
                s += '0';
            }
        }
        this.setByBinaryString(s);
    };

    /**
     * generate an array of falses with specified length<br/>
     * @name newFalseArray
     * @memberOf KJUR.asn1.DERBitString
     * @function
     * @param {Integer} nLength length of array to generate
     * @return {array} array of boolean falses
     * @description
     * This static method may be useful to initialize boolean array.
     * @example
     * o = new KJUR.asn1.DERBitString();
     * o.newFalseArray(3) &rarr; [false, false, false]
     */
    this.newFalseArray = function(nLength) {
        var a = new Array(nLength);
        for (var i = 0; i < nLength; i++) {
            a[i] = false;
        }
        return a;
    };

    this.getFreshValueHex = function() {
        return this.hV;
    };

    if (typeof params != "undefined") {
        if (typeof params == "string" && params.toLowerCase().match(/^[0-9a-f]+$/)) {
            this.setHexValueIncludingUnusedBits(params);
        } else if (typeof params['hex'] != "undefined") {
            this.setHexValueIncludingUnusedBits(params['hex']);
        } else if (typeof params['bin'] != "undefined") {
            this.setByBinaryString(params['bin']);
        } else if (typeof params['array'] != "undefined") {
            this.setByBooleanArray(params['array']);
        }
    }
};
extendClass(KJUR.asn1.DERBitString, KJUR.asn1.ASN1Object);

// ********************************************************************
/**
 * class for ASN.1 DER OctetString<br/>
 * @name KJUR.asn1.DEROctetString
 * @class class for ASN.1 DER OctetString
 * @param {Array} params associative array of parameters (ex. {'str': 'aaa'})
 * @extends KJUR.asn1.DERAbstractString
 * @description
 * This class provides ASN.1 OctetString simple type.<br/>
 * Supported "params" attributes are:
 * <ul>
 * <li>str - to set a string as a value</li>
 * <li>hex - to set a hexadecimal string as a value</li>
 * <li>obj - to set a encapsulated ASN.1 value by JSON object 
 * which is defined in {@link KJUR.asn1.ASN1Util.newObject}</li>
 * </ul>
 * NOTE: A parameter 'obj' have been supported 
 * for "OCTET STRING, encapsulates" structure.
 * since asn1 1.0.11, jsrsasign 6.1.1 (2016-Sep-25).
 * @see KJUR.asn1.DERAbstractString - superclass
 * @example
 * // default constructor
 * o = new KJUR.asn1.DEROctetString();
 * // initialize with string
 * o = new KJUR.asn1.DEROctetString({str: "aaa"});
 * // initialize with hexadecimal string
 * o = new KJUR.asn1.DEROctetString({hex: "616161"});
 * // initialize with ASN1Util.newObject argument 
 * o = new KJUR.asn1.DEROctetString({obj: {seq: [{int: 3}, {prnstr: 'aaa'}]}});
 * // above generates a ASN.1 data like this:
 * // OCTET STRING, encapsulates {
 * //   SEQUENCE {
 * //     INTEGER 3
 * //     PrintableString 'aaa'
 * //     }
 * //   } 
 */
KJUR.asn1.DEROctetString = function(params) {
    if (params !== undefined && typeof params.obj !== "undefined") {
	var o = KJUR.asn1.ASN1Util.newObject(params.obj);
	params.hex = o.tohex();
    }
    KJUR.asn1.DEROctetString.superclass.constructor.call(this, params);
    this.hT = "04";
};
extendClass(KJUR.asn1.DEROctetString, KJUR.asn1.DERAbstractString);

// ********************************************************************
/**
 * class for ASN.1 DER Null
 * @name KJUR.asn1.DERNull
 * @class class for ASN.1 DER Null
 * @extends KJUR.asn1.ASN1Object
 * @description
 * @see KJUR.asn1.ASN1Object - superclass
 */
KJUR.asn1.DERNull = function() {
    KJUR.asn1.DERNull.superclass.constructor.call(this);
    this.hT = "05";
    this.hTLV = "0500";
};
extendClass(KJUR.asn1.DERNull, KJUR.asn1.ASN1Object);

// ********************************************************************
/**
 * class for ASN.1 DER ObjectIdentifier
 * @name KJUR.asn1.DERObjectIdentifier
 * @class class for ASN.1 DER ObjectIdentifier
 * @param {Object} JSON object or string of parameters (ex. {'oid': '2.5.4.5'})
 * @extends KJUR.asn1.ASN1Object
 * @see oidtohex
 * 
 * @description
 * <br/>
 * As for argument 'params' for constructor, you can specify one of
 * following properties:
 * <ul>
 * <li>oid - specify initial ASN.1 value(V) by a oid string (ex. 2.5.4.13)</li>
 * <li>hex - specify initial ASN.1 value(V) by a hexadecimal string</li>
 * </ul>
 * NOTE: 'params' can be omitted.
 * @example
 * new DERObjectIdentifier({"name": "sha1"})
 * new DERObjectIdentifier({"oid": "1.2.3.4"})
 * new DERObjectIdentifier({"hex": "2d..."})
 * new DERObjectIdentifier("1.2.3.4")
 * new DERObjectIdentifier("SHA1withRSA")
 */
KJUR.asn1.DERObjectIdentifier = function(params) {
    KJUR.asn1.DERObjectIdentifier.superclass.constructor.call(this);
    this.hT = "06";

    /**
     * set value by a hexadecimal string
     * @name setValueHex
     * @memberOf KJUR.asn1.DERObjectIdentifier#
     * @function
     * @param {String} newHexString hexadecimal value of OID bytes
     */
    this.setValueHex = function(newHexString) {
        this.hTLV = null;
        this.isModified = true;
        this.s = null;
        this.hV = newHexString;
    };

    /**
     * set value by a OID string<br/>
     * @name setValueOidString
     * @memberOf KJUR.asn1.DERObjectIdentifier#
     * @function
     * @param {String} oidString OID string (ex. 2.5.4.13)
     * @example
     * o = new KJUR.asn1.DERObjectIdentifier();
     * o.setValueOidString("2.5.4.13");
     */
    this.setValueOidString = function(oidString) {
	var h = oidtohex(oidString);
	if (h == null)
            throw new Error("malformed oid string: " + oidString);
        this.hTLV = null;
        this.isModified = true;
        this.s = null;
        this.hV = h;
    };

    /**
     * set value by a OID name
     * @name setValueName
     * @memberOf KJUR.asn1.DERObjectIdentifier#
     * @function
     * @param {String} oidName OID name (ex. 'serverAuth')
     * @since 1.0.1
     * @description
     * OID name shall be defined in 'KJUR.asn1.x509.OID.name2oidList'.
     * Otherwise raise error.
     * @example
     * o = new KJUR.asn1.DERObjectIdentifier();
     * o.setValueName("serverAuth");
     */
    this.setValueName = function(oidName) {
	var oid = KJUR.asn1.x509.OID.name2oid(oidName);
	if (oid !== '') {
            this.setValueOidString(oid);
        } else {
            throw new Error("DERObjectIdentifier oidName undefined: " + oidName);
        }
    };

    this.setValueNameOrOid = function(nameOrOid) {
	if (nameOrOid.match(/^[0-2].[0-9.]+$/)) {
	    this.setValueOidString(nameOrOid);
	} else {
	    this.setValueName(nameOrOid);
	}
    }

    this.getFreshValueHex = function() {
        return this.hV;
    };

    this.setByParam = function(params) {
        if (typeof params === "string") {
	    this.setValueNameOrOid(params);
        } else if (params.oid !== undefined) {
	    this.setValueNameOrOid(params.oid);
        } else if (params.name !== undefined) {
            this.setValueNameOrOid(params.name);
        } else if (params.hex !== undefined) {
            this.setValueHex(params.hex);
        }
    };

    if (params !== undefined) this.setByParam(params);
};
extendClass(KJUR.asn1.DERObjectIdentifier, KJUR.asn1.ASN1Object);

// ********************************************************************
/**
 * class for ASN.1 DER Enumerated
 * @name KJUR.asn1.DEREnumerated
 * @class class for ASN.1 DER Enumerated
 * @extends KJUR.asn1.ASN1Object
 * @description
 * <br/>
 * As for argument 'params' for constructor, you can specify one of
 * following properties:
 * <ul>
 * <li>int - specify initial ASN.1 value(V) by integer value</li>
 * <li>hex - specify initial ASN.1 value(V) by a hexadecimal string</li>
 * </ul>
 * NOTE: 'params' can be omitted.
 * @example
 * new KJUR.asn1.DEREnumerated(123);
 * new KJUR.asn1.DEREnumerated({int: 123});
 * new KJUR.asn1.DEREnumerated({hex: '1fad'});
 */
KJUR.asn1.DEREnumerated = function(params) {
    KJUR.asn1.DEREnumerated.superclass.constructor.call(this);
    this.hT = "0a";

    /**
     * set value by Tom Wu's BigInteger object
     * @name setByBigInteger
     * @memberOf KJUR.asn1.DEREnumerated#
     * @function
     * @param {BigInteger} bigIntegerValue to set
     */
    this.setByBigInteger = function(bigIntegerValue) {
        this.hTLV = null;
        this.isModified = true;
        this.hV = KJUR.asn1.ASN1Util.bigIntToMinTwosComplementsHex(bigIntegerValue);
    };

    /**
     * set value by integer value
     * @name setByInteger
     * @memberOf KJUR.asn1.DEREnumerated#
     * @function
     * @param {Integer} integer value to set
     */
    this.setByInteger = function(intValue) {
        var bi = new BigInteger(String(intValue), 10);
        this.setByBigInteger(bi);
    };

    /**
     * set value by integer value
     * @name setValueHex
     * @memberOf KJUR.asn1.DEREnumerated#
     * @function
     * @param {String} hexadecimal string of integer value
     * @description
     * <br/>
     * NOTE: Value shall be represented by minimum octet length of
     * two's complement representation.
     */
    this.setValueHex = function(newHexString) {
        this.hV = newHexString;
    };

    this.getFreshValueHex = function() {
        return this.hV;
    };

    if (typeof params != "undefined") {
        if (typeof params['int'] != "undefined") {
            this.setByInteger(params['int']);
        } else if (typeof params == "number") {
            this.setByInteger(params);
        } else if (typeof params['hex'] != "undefined") {
            this.setValueHex(params['hex']);
        }
    }
};
extendClass(KJUR.asn1.DEREnumerated, KJUR.asn1.ASN1Object);

// ********************************************************************
/**
 * class for ASN.1 DER UTF8String
 * @name KJUR.asn1.DERUTF8String
 * @class class for ASN.1 DER UTF8String
 * @param {Array} params associative array of parameters (ex. {'str': 'aaa'})
 * @extends KJUR.asn1.DERAbstractString
 * @description
 * @see KJUR.asn1.DERAbstractString - superclass
 */
KJUR.asn1.DERUTF8String = function(params) {
    KJUR.asn1.DERUTF8String.superclass.constructor.call(this, params);
    this.hT = "0c";
};
extendClass(KJUR.asn1.DERUTF8String, KJUR.asn1.DERAbstractString);

// ********************************************************************
/**
 * class for ASN.1 DER NumericString
 * @name KJUR.asn1.DERNumericString
 * @class class for ASN.1 DER NumericString
 * @param {Array} params associative array of parameters (ex. {'str': 'aaa'})
 * @extends KJUR.asn1.DERAbstractString
 * @description
 * @see KJUR.asn1.DERAbstractString - superclass
 */
KJUR.asn1.DERNumericString = function(params) {
    KJUR.asn1.DERNumericString.superclass.constructor.call(this, params);
    this.hT = "12";
};
extendClass(KJUR.asn1.DERNumericString, KJUR.asn1.DERAbstractString);

// ********************************************************************
/**
 * class for ASN.1 DER PrintableString
 * @name KJUR.asn1.DERPrintableString
 * @class class for ASN.1 DER PrintableString
 * @param {Array} params associative array of parameters (ex. {'str': 'aaa'})
 * @extends KJUR.asn1.DERAbstractString
 * @description
 * @see KJUR.asn1.DERAbstractString - superclass
 */
KJUR.asn1.DERPrintableString = function(params) {
    KJUR.asn1.DERPrintableString.superclass.constructor.call(this, params);
    this.hT = "13";
};
extendClass(KJUR.asn1.DERPrintableString, KJUR.asn1.DERAbstractString);

// ********************************************************************
/**
 * class for ASN.1 DER TeletexString
 * @name KJUR.asn1.DERTeletexString
 * @class class for ASN.1 DER TeletexString
 * @param {Array} params associative array of parameters (ex. {'str': 'aaa'})
 * @extends KJUR.asn1.DERAbstractString
 * @description
 * @see KJUR.asn1.DERAbstractString - superclass
 */
KJUR.asn1.DERTeletexString = function(params) {
    KJUR.asn1.DERTeletexString.superclass.constructor.call(this, params);
    this.hT = "14";
};
extendClass(KJUR.asn1.DERTeletexString, KJUR.asn1.DERAbstractString);

// ********************************************************************
/**
 * class for ASN.1 DER IA5String
 * @name KJUR.asn1.DERIA5String
 * @class class for ASN.1 DER IA5String
 * @param {Array} params associative array of parameters (ex. {'str': 'aaa'})
 * @extends KJUR.asn1.DERAbstractString
 * @description
 * @see KJUR.asn1.DERAbstractString - superclass
 */
KJUR.asn1.DERIA5String = function(params) {
    KJUR.asn1.DERIA5String.superclass.constructor.call(this, params);
    this.hT = "16";
};
extendClass(KJUR.asn1.DERIA5String, KJUR.asn1.DERAbstractString);

// ********************************************************************
/**
 * class for ASN.1 DER VisibleString
 * @name KJUR.asn1.DERVisibleString
 * @class class for ASN.1 DER VisibleString
 * @param {Array} params associative array of parameters (ex. {'str': 'aaa'})
 * @extends KJUR.asn1.DERAbstractString
 * @since jsrsasign 8.0.23 asn1 1.0.15
 * @description
 * @see KJUR.asn1.DERAbstractString - superclass
 */
KJUR.asn1.DERVisibleString = function(params) {
    KJUR.asn1.DERIA5String.superclass.constructor.call(this, params);
    this.hT = "1a";
};
extendClass(KJUR.asn1.DERVisibleString, KJUR.asn1.DERAbstractString);

// ********************************************************************
/**
 * class for ASN.1 DER BMPString
 * @name KJUR.asn1.DERBMPString
 * @class class for ASN.1 DER BMPString
 * @param {Array} params associative array of parameters (ex. {'str': 'aaa'})
 * @extends KJUR.asn1.DERAbstractString
 * @since jsrsasign 8.0.23 asn1 1.0.15
 * @description
 * @see KJUR.asn1.DERAbstractString - superclass
 */
KJUR.asn1.DERBMPString = function(params) {
    KJUR.asn1.DERBMPString.superclass.constructor.call(this, params);
    this.hT = "1e";
};
extendClass(KJUR.asn1.DERBMPString, KJUR.asn1.DERAbstractString);

// ********************************************************************
/**
 * class for ASN.1 DER UTCTime
 * @name KJUR.asn1.DERUTCTime
 * @class class for ASN.1 DER UTCTime
 * @param {Array} params associative array of parameters (ex. {'str': '130430235959Z'})
 * @extends KJUR.asn1.DERAbstractTime
 * @see KJUR.asn1.DERGeneralizedTime
 * @see KJUR.asn1.x509.Time
 *
 * @description
 * <br/>
 * As for argument 'params' for constructor, you can specify one of
 * following properties:
 * <ul>
 * <li>str - specify initial ASN.1 value(V) by a string (ex.'130430235959Z')</li>
 * <li>date - specify Date object.</li>
 * <li>millis - specify flag to show milliseconds (from 1.0.6)</li>
 * </ul>
 * NOTE1: 'params' can be omitted.
 * NOTE2: 'millis' property is supported from jsrsasign 10.4.1 asn1 1.0.22.
 *
 * <h4>EXAMPLES</h4>
 * @example
 * new DERUTCTime("20151231235959Z")
 * new DERUTCTime("20151231235959.123Z")
 * new DERUTCTime(new Date())
 * new DERUTCTime(new Date(Date.UTC(2015,11,31,23,59,59,123)))
 * new DERUTCTime({str: "20151231235959.123Z"})
 * new DERUTCTime({date: new Date()})
 * new DERUTCTime({date: new Date(), millis: true})
 * new DERUTCTime({millis: true})
 */
KJUR.asn1.DERUTCTime = function(params) {
    KJUR.asn1.DERUTCTime.superclass.constructor.call(this, params);
    this.hT = "17";
    this.params = undefined;

    this.getFreshValueHex = function() {
	var params = this.params;

	if (this.params == undefined) params = { date: new Date() };

	if (typeof params == "string") {
	    if (params.match(/^[0-9]{12}Z$/) ||
		params.match(/^[0-9]{12}\.[0-9]+Z$/)) {
		this.hV = stohex(params);
	    } else {
		throw new Error("malformed string for UTCTime: " + params);
	    }
	} else if (params.str != undefined) {
	    this.hV = stohex(params.str);
	} else if (params.date == undefined && params.millis == true) {
	    var date = new Date();
	    this.hV = stohex(this.formatDate(date, 'utc', true));
	} else if (params.date != undefined &&
		   params.date instanceof Date) {
	    var withMillis = (params.millis === true);
	    this.hV = stohex(this.formatDate(params.date, 'utc', withMillis));
	} else if (params instanceof Date) {
	    this.hV = stohex(this.formatDate(params, 'utc'));
	}

	if (this.hV == undefined) {
	    throw new Error("parameter not specified properly for UTCTime");
	}
	return this.hV;
    };

    if (params != undefined) this.setByParam(params);
};
extendClass(KJUR.asn1.DERUTCTime, KJUR.asn1.DERAbstractTime);

// ********************************************************************
/**
 * class for ASN.1 DER GeneralizedTime
 * @name KJUR.asn1.DERGeneralizedTime
 * @class class for ASN.1 DER GeneralizedTime
 * @param {Array} params associative array of parameters (ex. {'str': '20130430235959Z'})
 * @property {Boolean} withMillis flag to show milliseconds or not
 * @extends KJUR.asn1.DERAbstractTime
 * @see KJUR.asn1.DERUTCTime
 * @see KJUR.asn1.x509.Time
 *
 * @description
 * <br/>
 * As for argument 'params' for constructor, you can specify one of
 * following properties:
 * <ul>
 * <li>str - specify initial ASN.1 value(V) by a string (ex.'20130430235959Z')</li>
 * <li>date - specify Date object.</li>
 * <li>millis - specify flag to show milliseconds (from 1.0.6)</li>
 * </ul>
 * NOTE1: 'params' can be omitted.
 * NOTE2: 'millis' property is supported from asn1 1.0.6.
 *
 * <h4>EXAMPLES</h4>
 * @example
 * new DERGeneralizedTime("20151231235959Z")
 * new DERGeneralizedTime("20151231235959.123Z")
 * new DERGeneralizedTime(new Date())
 * new DERGeneralizedTime(new Date(Date.UTC(2015,11,31,23,59,59,123)))
 * new DERGeneralizedTime({str: "20151231235959.123Z"})
 * new DERGeneralizedTime({date: new Date()})
 * new DERGeneralizedTime({date: new Date(), millis: true})
 * new DERGeneralizedTime({millis: true})
 */
KJUR.asn1.DERGeneralizedTime = function(params) {
    KJUR.asn1.DERGeneralizedTime.superclass.constructor.call(this, params);
    this.hT = "18";
    this.params = params;

    this.getFreshValueHex = function() {
	var params = this.params;

	if (this.params == undefined) params = { date: new Date() };

	if (typeof params == "string") {
	    if (params.match(/^[0-9]{14}Z$/) ||
		params.match(/^[0-9]{14}\.[0-9]+Z$/)) {
		this.hV = stohex(params);
	    } else {
		throw new Error("malformed string for GeneralizedTime: " + params);
	    }
	} else if (params.str != undefined) {
	    this.hV = stohex(params.str);
	} else if (params.date == undefined && params.millis == true) {
	    var date = new Date();
	    this.hV = stohex(this.formatDate(date, 'gen', true));
	} else if (params.date != undefined &&
		   params.date instanceof Date) {
	    var withMillis = (params.millis === true);
	    this.hV = stohex(this.formatDate(params.date, 'gen', withMillis));
	} else if (params instanceof Date) {
	    this.hV = stohex(this.formatDate(params, 'gen'));
	}

	if (this.hV == undefined) {
	    throw new Error("parameter not specified properly for GeneralizedTime");
	}
	return this.hV;
    };

    if (params != undefined) this.setByParam(params);
};
extendClass(KJUR.asn1.DERGeneralizedTime, KJUR.asn1.DERAbstractTime);

// ********************************************************************
/**
 * class for ASN.1 DER Sequence
 * @name KJUR.asn1.DERSequence
 * @class class for ASN.1 DER Sequence
 * @extends KJUR.asn1.DERAbstractStructured
 * @description
 * <br/>
 * As for argument 'params' for constructor, you can specify one of
 * following properties:
 * <ul>
 * <li>array - specify array of ASN1Object to set elements of content</li>
 * </ul>
 * NOTE: 'params' can be omitted.
 */
KJUR.asn1.DERSequence = function(params) {
    KJUR.asn1.DERSequence.superclass.constructor.call(this, params);
    this.hT = "30";
    this.getFreshValueHex = function() {
        var h = '';
        for (var i = 0; i < this.asn1Array.length; i++) {
            var asn1Obj = this.asn1Array[i];
            h += asn1Obj.tohex();
        }
        this.hV = h;
        return this.hV;
    };
};
extendClass(KJUR.asn1.DERSequence, KJUR.asn1.DERAbstractStructured);

// ********************************************************************
/**
 * class for ASN.1 DER Set
 * @name KJUR.asn1.DERSet
 * @class class for ASN.1 DER Set
 * @extends KJUR.asn1.DERAbstractStructured
 * @description
 * <br/>
 * As for argument 'params' for constructor, you can specify one of
 * following properties:
 * <ul>
 * <li>array - specify array of ASN1Object to set elements of content</li>
 * <li>sortflag - flag for sort (default: true). ASN.1 BER is not sorted in 'SET OF'.</li>
 * </ul>
 * NOTE1: 'params' can be omitted.<br/>
 * NOTE2: sortflag is supported since 1.0.5.
 */
KJUR.asn1.DERSet = function(params) {
    KJUR.asn1.DERSet.superclass.constructor.call(this, params);
    this.hT = "31";
    this.sortFlag = true; // item shall be sorted only in ASN.1 DER
    this.getFreshValueHex = function() {
        var a = new Array();
        for (var i = 0; i < this.asn1Array.length; i++) {
            var asn1Obj = this.asn1Array[i];
            a.push(asn1Obj.tohex());
        }
        if (this.sortFlag == true) a.sort();
        this.hV = a.join('');
        return this.hV;
    };

    if (typeof params != "undefined") {
        if (typeof params.sortflag != "undefined" &&
            params.sortflag == false)
            this.sortFlag = false;
    }
};
extendClass(KJUR.asn1.DERSet, KJUR.asn1.DERAbstractStructured);

// ********************************************************************
/**
 * class for ASN.1 DER TaggedObject
 * @name KJUR.asn1.DERTaggedObject
 * @class class for ASN.1 DER TaggedObject
 * @extends KJUR.asn1.ASN1Object
 *
 * @description
 * <br/>
 * Parameter 'tagNoNex' is ASN.1 tag(T) value for this object.
 * For example, if you find '[1]' tag in a ASN.1 dump, 
 * 'tagNoHex' will be 'a1'.
 * <br/>
 * As for optional argument 'params' for constructor, you can specify *ANY* of
 * following properties:
 * <ul>
 * <li>tag - specify tag (default is 'a0' which means [0])</li>
 * <li>explicit - specify true if this is explicit tag otherwise false 
 *     (default is 'true').</li>
 * <li>obj - specify ASN1Object which is tagged</li>
 * <li>tage - specify tag with explicit</li>
 * <li>tagi - specify tag with implicit</li>
 * </ul>
 *
 * @example
 * new KJUR.asn1.DERTaggedObject({
 *  tage:'a0', obj: new KJUR.asn1.DERInteger({int: 3}) // explicit
 * }) 
 * new KJUR.asn1.DERTaggedObject({
 *  tagi:'a0', obj: new KJUR.asn1.DERInteger({int: 3}) // implicit
 * }) 
 * new KJUR.asn1.DERTaggedObject({
 *  tag:'a0', explicit: true, obj: new KJUR.asn1.DERInteger({int: 3}) // explicit
 * }) 
 *
 * // to hexadecimal
 * d1 = new KJUR.asn1.DERUTF8String({str':'a'})
 * d2 = new KJUR.asn1.DERTaggedObject({'obj': d1});
 * hex = d2.tohex();
 */
KJUR.asn1.DERTaggedObject = function(params) {
    KJUR.asn1.DERTaggedObject.superclass.constructor.call(this);

    var _KJUR_asn1 = KJUR.asn1,
	_ASN1HEX = ASN1HEX,
	_getV = _ASN1HEX.getV,
	_isASN1HEX = _ASN1HEX.isASN1HEX,
	_newObject = _KJUR_asn1.ASN1Util.newObject;

    this.hT = "a0";
    this.hV = '';
    this.isExplicit = true;
    this.asn1Object = null;
    this.params = {tag: "a0", explicit: true}; //"tag": "a0, "explicit": true};

    /**
     * set value by an ASN1Object
     * @name setString
     * @memberOf KJUR.asn1.DERTaggedObject#
     * @function
     * @param {Boolean} isExplicitFlag flag for explicit/implicit tag
     * @param {Integer} tagNoHex hexadecimal string of ASN.1 tag
     * @param {ASN1Object} asn1Object ASN.1 to encapsulate
     * @deprecated since jsrsasign 10.5.4 please use setByParam instead
     */
    this.setASN1Object = function(isExplicitFlag, tagNoHex, asn1Object) {
	this.params = {tag: tagNoHex,
		       explicit: isExplicitFlag,
		       obj: asn1Object};
    };

    this.getFreshValueHex = function() {
	var params = this.params;

	if (params.explicit == undefined) params.explicit = true;

	if (params.tage != undefined) {
	    params.tag = params.tage;
	    params.explicit = true;
	}
	if (params.tagi != undefined) {
	    params.tag = params.tagi;
	    params.explicit = false;
	}

	if (params.str != undefined) {
	    this.hV = utf8tohex(params.str);
	} else if (params.hex != undefined) {
	    this.hV = params.hex;
	} else if (params.obj != undefined) {
	    var hV1;
	    if (params.obj instanceof _KJUR_asn1.ASN1Object) {
		hV1 = params.obj.tohex();
	    } else if (typeof params.obj == "object") {
		hV1 = _newObject(params.obj).tohex();
	    }
	    if (params.explicit) {
		this.hV = hV1;
	    } else {
		this.hV = _getV(hV1, 0);
	    }
	} else {
	    throw new Error("str, hex nor obj not specified");
	}

	if (params.tag == undefined) params.tag = "a0";
	this.hT = params.tag;
        this.hTLV = null;
        this.isModified = true;

        return this.hV;
    };

    this.setByParam = function(params) {
	this.params = params;
    };

    if (params !== undefined) this.setByParam(params);
};
extendClass(KJUR.asn1.DERTaggedObject, KJUR.asn1.ASN1Object);

/* asn1hex-1.2.15.js (c) 2012-2022 Kenji Urushima | kjur.github.io/jsrsasign/license
 */
/*
 * asn1hex.js - Hexadecimal represented ASN.1 string library
 *
 * Copyright (c) 2010-2022 Kenji Urushima (kenji.urushima@gmail.com)
 *
 * This software is licensed under the terms of the MIT License.
 * https://kjur.github.io/jsrsasign/license/
 *
 * The above copyright and license notice shall be 
 * included in all copies or substantial portions of the Software.
 */

/**
 * @fileOverview
 * @name asn1hex-1.1.js
 * @author Kenji Urushima kenji.urushima@gmail.com
 * @version jsrsasign 10.5.23 asn1hex 1.2.15 (2022-May-27)
 * @license <a href="https://kjur.github.io/jsrsasign/license/">MIT License</a>
 */

/*
 * MEMO:
 *   f('3082025b02...', 2) ... 82025b ... 3bytes
 *   f('020100', 2) ... 01 ... 1byte
 *   f('0203001...', 2) ... 03 ... 1byte
 *   f('02818003...', 2) ... 8180 ... 2bytes
 *   f('3080....0000', 2) ... 80 ... -1
 *
 *   Requirements:
 *   - ASN.1 type octet length MUST be 1. 
 *     (i.e. ASN.1 primitives like SET, SEQUENCE, INTEGER, OCTETSTRING ...)
 */

/**
 * ASN.1 DER encoded hexadecimal string utility class
 * @name ASN1HEX
 * @class ASN.1 DER encoded hexadecimal string utility class
 * @since jsrsasign 1.1
 * @description
 * This class provides a parser for hexadecimal string of
 * DER encoded ASN.1 binary data.
 * Here are major methods of this class.
 * <ul>
 * <li><b>ACCESS BY POSITION</b>
 *   <ul>
 *   <li>{@link ASN1HEX.getTLV} - get ASN.1 TLV at specified position</li>
 *   <li>{@link ASN1HEX.getTLVblen} - get byte length of ASN.1 TLV at specified position</li>
 *   <li>{@link ASN1HEX.getV} - get ASN.1 V at specified position</li>
 *   <li>{@link ASN1HEX.getVblen} - get integer ASN.1 L at specified position</li>
 *   <li>{@link ASN1HEX.getVidx} - get ASN.1 V position from its ASN.1 TLV position</li>
 *   <li>{@link ASN1HEX.getL} - get hexadecimal ASN.1 L at specified position</li>
 *   <li>{@link ASN1HEX.getLblen} - get byte length for ASN.1 L(length) bytes</li>
 *   </ul>
 * </li>
 * <li><b>ACCESS FOR CHILD ITEM</b>
 *   <ul>
 *   <li>{@link ASN1HEX.getNthChildIdx} - get nth child index at specified position</li>
 *   <li>{@link ASN1HEX.getChildIdx} - get indexes of children</li>
 *   <li>{@link ASN1HEX.getNextSiblingIdx} - get position of next sibling (DEPRECATED)</li>
 *   </ul>
 * </li>
 * <li><b>ACCESS NESTED ASN.1 STRUCTURE</b>
 *   <ul>
 *   <li>{@link ASN1HEX.getTLVbyList} - get ASN.1 TLV at specified list index</li>
 *   <li>{@link ASN1HEX.getVbyList} - get ASN.1 V at specified nth list index with checking expected tag</li>
 *   <li>{@link ASN1HEX.getIdxbyList} - get index at specified list index</li>
 *   </ul>
 * </li>
 * <li><b>(NEW)ACCESS NESTED ASN.1 STRUCTURE</b>
 *   <ul>
 *   <li>{@link ASN1HEX.getTLVbyListEx} - get ASN.1 TLV at specified list index</li>
 *   <li>{@link ASN1HEX.getVbyListEx} - get ASN.1 V at specified nth list index with checking expected tag</li>
 *   <li>{@link ASN1HEX.getIdxbyListEx} - get index at specified list index</li>
 *   </ul>
 * </li>
 * <li><b>UTILITIES</b>
 *   <ul>
 *   <li>{@link ASN1HEX.dump} - dump ASN.1 structure</li>
 *   <li>{@link ASN1HEX.isContextTag} - check if a hexadecimal tag is a specified ASN.1 context specific tag</li>
 *   <li>{@link ASN1HEX.isASN1HEX} - simple ASN.1 DER hexadecimal string checker</li>
 *   <li>{@link ASN1HEX.checkStrictDER} - strict ASN.1 DER hexadecimal string checker</li>
 *   <li>{@link ASN1HEX.hextooidstr} - convert hexadecimal string of OID to dotted integer list</li>
 *   </ul>
 * </li>
 * </ul>
 */
var ASN1HEX = new function() {
};

/**
 * get byte length for ASN.1 L(length) bytes<br/>
 * @name getLblen
 * @memberOf ASN1HEX
 * @function
 * @param {String} s hexadecimal string of ASN.1 DER encoded data
 * @param {Number} idx string index
 * @return byte length for ASN.1 L(length) bytes
 * @since jsrsasign 7.2.0 asn1hex 1.1.11
 * @example
 * ASN1HEX.getLblen('020100', 0) &rarr; 1 for '01'
 * ASN1HEX.getLblen('020200', 0) &rarr; 1 for '02'
 * ASN1HEX.getLblen('02818003...', 0) &rarr; 2 for '8180'
 * ASN1HEX.getLblen('0282025b03...', 0) &rarr; 3 for '82025b'
 * ASN1HEX.getLblen('0280020100...', 0) &rarr; -1 for '80' BER indefinite length
 * ASN1HEX.getLblen('02ffab...', 0) &rarr; -2 for malformed ASN.1 length
 */
ASN1HEX.getLblen = function(s, idx) {
    if (s.substr(idx + 2, 1) != '8') return 1;
    var i = parseInt(s.substr(idx + 3, 1));
    if (i == 0) return -1;             // length octet '80' indefinite length
    if (0 < i && i < 10) return i + 1; // including '8?' octet;
    return -2;                         // malformed format
};

/**
 * get hexadecimal string for ASN.1 L(length) bytes<br/>
 * @name getL
 * @memberOf ASN1HEX
 * @function
 * @param {String} s hexadecimal string of ASN.1 DER encoded data
 * @param {Number} idx string index to get L of ASN.1 object
 * @return {String} hexadecimal string for ASN.1 L(length) bytes
 * @since jsrsasign 7.2.0 asn1hex 1.1.11
 */
ASN1HEX.getL = function(s, idx) {
    var len = ASN1HEX.getLblen(s, idx);
    if (len < 1) return '';
    return s.substr(idx + 2, len * 2);
};

/**
 * get integer value of ASN.1 length for ASN.1 data<br/>
 * @name getVblen
 * @memberOf ASN1HEX
 * @function
 * @param {String} s hexadecimal string of ASN.1 DER encoded data
 * @param {Number} idx string index
 * @return {Number} ASN.1 L(length) integer value
 * @since jsrsasign 7.2.0 asn1hex 1.1.11
 */
/*
 getting ASN.1 length value at the position 'idx' of
 hexa decimal string 's'.
 f('3082025b02...', 0) ... 82025b ... ???
 f('020100', 0) ... 01 ... 1
 f('0203001...', 0) ... 03 ... 3
 f('02818003...', 0) ... 8180 ... 128
 */
ASN1HEX.getVblen = function(s, idx) {
    var hLen, bi;
    hLen = ASN1HEX.getL(s, idx);
    if (hLen == '') return -1;
    if (hLen.substr(0, 1) === '8') {
        bi = new BigInteger(hLen.substr(2), 16);
    } else {
        bi = new BigInteger(hLen, 16);
    }
    return bi.intValue();
};

/**
 * get ASN.1 value starting string position for ASN.1 object refered by index 'idx'.
 * @name getVidx
 * @memberOf ASN1HEX
 * @function
 * @param {String} s hexadecimal string of ASN.1 DER encoded data
 * @param {Number} idx string index
 * @since jsrsasign 7.2.0 asn1hex 1.1.11
 */
ASN1HEX.getVidx = function(s, idx) {
    var l_len = ASN1HEX.getLblen(s, idx);
    if (l_len < 0) return l_len;
    return idx + (l_len + 1) * 2;
};

/**
 * get hexadecimal string of ASN.1 V(value)<br/>
 * @name getV
 * @memberOf ASN1HEX
 * @function
 * @param {String} s hexadecimal string of ASN.1 DER encoded data
 * @param {Number} idx string index
 * @return {String} hexadecimal string of ASN.1 value.
 * @since jsrsasign 7.2.0 asn1hex 1.1.11
 */
ASN1HEX.getV = function(s, idx) {
    var idx1 = ASN1HEX.getVidx(s, idx);
    var blen = ASN1HEX.getVblen(s, idx);
    return s.substr(idx1, blen * 2);
};

/**
 * get hexadecimal string of ASN.1 TLV at<br/>
 * @name getTLV
 * @memberOf ASN1HEX
 * @function
 * @param {String} s hexadecimal string of ASN.1 DER encoded data
 * @param {Number} idx string index
 * @return {String} hexadecimal string of ASN.1 TLV.
 * @since jsrsasign 7.2.0 asn1hex 1.1.11
 */
ASN1HEX.getTLV = function(s, idx) {
    return s.substr(idx, 2) + ASN1HEX.getL(s, idx) + ASN1HEX.getV(s, idx);
};

/**
 * get byte length of ASN.1 TLV at specified string index<br/>
 * @name getTLVblen
 * @memberOf ASN1HEX
 * @function
 * @param {String} h hexadecimal string of ASN.1 DER encoded data
 * @param {Number} idx string index to get ASN.1 TLV byte length
 * @return {Number} byte length of ASN.1 TLV
 * @since jsrsasign 9.1.5 asn1hex 1.1.11
 *
 * @description
 * This method returns a byte length of ASN.1 TLV at
 * specified string index.
 *
 * @example
 *                        v string indx=42
 * ASN1HEX.getTLVblen("...1303616161...", 42) &rarr; 10 (PrintableString 'aaa')
 */
ASN1HEX.getTLVblen = function(h, idx) {
    return 2 + ASN1HEX.getLblen(h, idx) * 2 + ASN1HEX.getVblen(h, idx) * 2;
};

// ========== sibling methods ================================

/**
 * get next sibling starting index for ASN.1 object string (DEPRECATED)<br/>
 * @name getNextSiblingIdx
 * @memberOf ASN1HEX
 * @function
 * @param {String} s hexadecimal string of ASN.1 DER encoded data
 * @param {Number} idx string index
 * @return {Number} next sibling starting index for ASN.1 object string
 * @since jsrsasign 7.2.0 asn1hex 1.1.11
 * @deprecated jsrsasign 9.1.5 asn1hex 1.2.5 Please use {@link ASN1HEX.getTLVblen}
 *
 * @example
 * SEQUENCE { INTEGER 3, INTEGER 4 }
 * 3006
 *     020103 :idx=4
 *           020104 :next sibling idx=10
 * getNextSiblingIdx("3006020103020104", 4) & rarr 10
 */
ASN1HEX.getNextSiblingIdx = function(s, idx) {
    var idx1 = ASN1HEX.getVidx(s, idx);
    var blen = ASN1HEX.getVblen(s, idx);
    return idx1 + blen * 2;
};

// ========== children methods ===============================
/**
 * get array of string indexes of child ASN.1 objects<br/>
 * @name getChildIdx
 * @memberOf ASN1HEX
 * @function
 * @param {String} h hexadecimal string of ASN.1 DER encoded data
 * @param {Number} idx start string index of ASN.1 object
 * @return {Array of Number} array of indexes for childen of ASN.1 objects
 * @since jsrsasign 7.2.0 asn1hex 1.1.11
 * @description
 * This method returns array of integers for a concatination of ASN.1 objects
 * in a ASN.1 value. As for BITSTRING, one byte of unusedbits is skipped.
 * As for other ASN.1 simple types such as INTEGER, OCTET STRING or PRINTABLE STRING,
 * it returns a array of a string index of its ASN.1 value.<br/>
 * NOTE: Since asn1hex 1.1.7 of jsrsasign 6.1.2, Encapsulated BitString is supported.
 * @example
 * ASN1HEX.getChildIdx("0203012345", 0) &rArr; [4] // INTEGER 012345
 * ASN1HEX.getChildIdx("1303616161", 0) &rArr; [4] // PrintableString aaa
 * ASN1HEX.getChildIdx("030300ffff", 0) &rArr; [6] // BITSTRING ffff (unusedbits=00a)
 * ASN1HEX.getChildIdx("3006020104020105", 0) &rArr; [4, 10] // SEQUENCE(INT4,INT5)
 */
ASN1HEX.getChildIdx = function(h, idx) {
    var _ASN1HEX = ASN1HEX;
    var a = [];
    var idxStart, totalChildBlen, currentChildBlen;

    idxStart = _ASN1HEX.getVidx(h, idx);
    totalChildBlen = _ASN1HEX.getVblen(h, idx) * 2;
    if (h.substr(idx, 2) == "03") {  // BITSTRING without unusedbits
	idxStart += 2;
	totalChildBlen -= 2;
    }

    currentChildBlen = 0;
    var i = idxStart;
    while (currentChildBlen <= totalChildBlen) {
	var tlvBlen = _ASN1HEX.getTLVblen(h, i);
	currentChildBlen += tlvBlen;
	if (currentChildBlen <= totalChildBlen) a.push(i);
	i += tlvBlen;
	if (currentChildBlen >= totalChildBlen) break;
    }
    return a;
};

/**
 * get string index of nth child object of ASN.1 object refered by h, idx<br/>
 * @name getNthChildIdx
 * @memberOf ASN1HEX
 * @function
 * @param {String} h hexadecimal string of ASN.1 DER encoded data
 * @param {Number} idx start string index of ASN.1 object
 * @param {Number} nth for child
 * @return {Number} string index of nth child.
 * @since jsrsasign 7.2.0 asn1hex 1.1.11
 */
ASN1HEX.getNthChildIdx = function(h, idx, nth) {
    var a = ASN1HEX.getChildIdx(h, idx);
    return a[nth];
};

// ========== decendant methods ==============================
/**
 * get string index of nth child object of ASN.1 object refered by h, idx<br/>
 * @name getIdxbyList
 * @memberOf ASN1HEX
 * @function
 * @param {String} h hexadecimal string of ASN.1 DER encoded data
 * @param {Number} currentIndex start string index of ASN.1 object
 * @param {Array of Number} nthList array list of nth
 * @param {String} checkingTag (OPTIONAL) string of expected ASN.1 tag for nthList 
 * @return {Number} string index refered by nthList
 * @since jsrsasign 7.1.4 asn1hex 1.1.10.
 * @description
 * @example
 * The "nthList" is a index list of structured ASN.1 object
 * reference. Here is a sample structure and "nthList"s which
 * refers each objects.
 *
 * SQUENCE               - 
 *   SEQUENCE            - [0]
 *     IA5STRING 000     - [0, 0]
 *     UTF8STRING 001    - [0, 1]
 *   SET                 - [1]
 *     IA5STRING 010     - [1, 0]
 *     UTF8STRING 011    - [1, 1]
 */
ASN1HEX.getIdxbyList = function(h, currentIndex, nthList, checkingTag) {
    var _ASN1HEX = ASN1HEX;
    var firstNth, a;
    if (nthList.length == 0) {
	if (checkingTag !== undefined) {
            if (h.substr(currentIndex, 2) !== checkingTag) return -1;
	}
        return currentIndex;
    }
    firstNth = nthList.shift();
    a = _ASN1HEX.getChildIdx(h, currentIndex);
    if (firstNth >= a.length) return -1;

    return _ASN1HEX.getIdxbyList(h, a[firstNth], nthList, checkingTag);
};

/**
 * get string index of nth child object of ASN.1 object refered by h, idx<br/>
 * @name getIdxbyListEx
 * @memberOf ASN1HEX
 * @function
 * @param {String} h hexadecimal string of ASN.1 DER encoded data
 * @param {Number} currentIndex start string index of ASN.1 object
 * @param {Array of Object} nthList array list of nth index value or context specific tag string (ex. "[0]")
 * @param {String} checkingTag (OPTIONAL) string of expected ASN.1 tag for nthList 
 * @return {Number} string index refered by nthList. return -1 if not found
 * @since jsrsasign 8.0.21 asn1hex 1.2.2
 * @see <a href="https://github.com/kjur/jsrsasign/wiki/Tutorial-for-accessing-deep-inside-of-ASN.1-structure-by-using-new-ASN1HEX.getIdxbyListEx">ASN1HEX.getIdxbyListEx tutorial wiki page</a>
 *
 * @description
 * This method returns the string index in h specified by currentIndex and
 * nthList. This is useful to dig into a deep structured ASN.1 object
 * by indexes called nthList. 
 * <br/>
 * A nthList consists of a position number in children of ASN.1
 * structured data or a context specific tag string (ex. "[1]").
 * Here is a sample deep structured ASN.1 data and
 * nthLists referring decendent objects.
 * <blockquote><pre>
 * SQUENCE               - referring nthList is below:
 *   SEQUENCE            - [0]
 *     IA5STRING "a1"    - [0, 0]
 *     UTF8STRING "a2"   - [0, 1]
 *   SET                 - [1]
 *     IA5STRING "b1"    - [1, 0]
 *     UTF8STRING "b2"   - [1, 1]
 *     [0] "b3"          - [1, "[0]"] // optional since context tag
 *     [1] "b4"          - [1, "[1]"] // optional since context tag
 *     IA5STRING "b5"    - [1, 2] // context is skipped. next is 2
 *     UTF8STRING "b6"   - [1, 3]
 * </pre></blockquote>
 *
 * <br/>
 * This method can dig into ASN.1 object encapsulated by
 * OctetString or BitString with unused bits.
 *
 * @example
 * 3014 seq idx=0
 *   3012 seq idx=4
 *     020101 int:1 idx=8
 *     020102 int:2 idx=14
 *     800103 [0]:3 idx=20
 *     810104 [1]:4 idx=26
 *     020105 int:5 idx=32
 *     020106 int:6 idx=38
 * h = "30140412020101020102800103810104020105020106";
 * ASN1HEX.getIdxbyListEx(h, 0, [0, "[0]"]) &rarr; 16
 * ASN1HEX.getIdxbyListEx(h, 0, [0, 2]) &rarr; 28
 * ASN1HEX.getIdxbyListEx(h, 0, [0, 2], "0c") &rarr; -1 //not UTF8String(0c)
 */
ASN1HEX.getIdxbyListEx = function(h, currentIndex, nthList, checkingTag) {
    var _ASN1HEX = ASN1HEX;
    var firstNth, a;
    if (nthList.length == 0) {
	if (checkingTag !== undefined) {
            if (h.substr(currentIndex, 2) !== checkingTag) {
		return -1;
            }
	}
        return currentIndex;
    }
    firstNth = nthList.shift();
    a = _ASN1HEX.getChildIdx(h, currentIndex);

    var count = 0;
    for (var i = 0; i < a.length; i++) {
	var childTag = h.substr(a[i], 2);

	if ((typeof firstNth == "number" &&
	     (! _ASN1HEX.isContextTag(childTag)) &&
	     count == firstNth) ||
	    (typeof firstNth == "string" &&
	     _ASN1HEX.isContextTag(childTag, firstNth))) {
	    return _ASN1HEX.getIdxbyListEx(h, a[i], nthList, checkingTag);
	}
	if (! _ASN1HEX.isContextTag(childTag)) count++;
    }
    return -1;
};

/**
 * get ASN.1 TLV by nthList<br/>
 * @name getTLVbyList
 * @memberOf ASN1HEX
 * @function
 * @param {String} h hexadecimal string of ASN.1 structure
 * @param {Integer} currentIndex string index to start searching in hexadecimal string "h"
 * @param {Array} nthList array of nth list index
 * @param {String} checkingTag (OPTIONAL) string of expected ASN.1 tag for nthList 
 * @return {String} referred hexadecimal string of ASN.1 TLV or null
 * @since jsrsasign 7.1.4 asn1hex 1.1.10
 *
 * @description
 * This static method is to get a ASN.1 value which specified "nthList" position
 * with checking expected tag "checkingTag".
 * <br/>
 * When referring value can't be found, this returns null.
 */
ASN1HEX.getTLVbyList = function(h, currentIndex, nthList, checkingTag) {
    var _ASN1HEX = ASN1HEX;
    var idx = _ASN1HEX.getIdxbyList(h, currentIndex, nthList, checkingTag);

    if (idx == -1) return null;
    if (idx >= h.length) return null;

    return _ASN1HEX.getTLV(h, idx);
};

/**
 * get ASN.1 TLV by nthList<br/>
 * @name getTLVbyListEx
 * @memberOf ASN1HEX
 * @function
 * @param {String} h hexadecimal string of ASN.1 structure
 * @param {Integer} currentIndex string index to start searching in hexadecimal string "h"
 * @param {Array of Object} nthList array list of nth index value or context specific tag string (ex. "[0]")
 * @param {String} checkingTag (OPTIONAL) string of expected ASN.1 tag for nthList 
 * @return {String} hexadecimal ASN.1 TLV string refered by nthList. return null if not found
 * @since jsrsasign 8.0.21 asn1hex 1.2.2
 * @see <a href="https://github.com/kjur/jsrsasign/wiki/Tutorial-for-accessing-deep-inside-of-ASN.1-structure-by-using-new-ASN1HEX.getIdxbyListEx">ASN1HEX.getIdxbyListEx tutorial wiki page</a>
 * @see {@link ASN1HEX.getIdxbyListEx}
 * @description
 * This static method is to get a ASN.1 value which specified "nthList" position
 * with checking expected tag "checkingTag".
 * This method can dig into ASN.1 object encapsulated by
 * OctetString or BitString with unused bits.
 * @example
 * 3014 seq idx=0
 *   0312 seq idx=4
 *     020101 int:1 idx=8
 *     020102 int:2 idx=14
 *     800103 [0]:3 idx=20
 *     810104 [1]:4 idx=26
 *     020105 int:5 idx=32
 *     020106 int:6 idx=38
 * h = "30140412020101020102800103810104020105020106";
 * ASN1HEX.getTLVbyList(h, 0, [0, "[0]"]) &rarr; 800103
 * ASN1HEX.getTLVbyList(h, 0, [0, 2]) &rarr; 020105
 * ASN1HEX.getTLVbyList(h, 0, [0, 2], "0c") &rarr; null //not UTF8String(0c)
 */
ASN1HEX.getTLVbyListEx = function(h, currentIndex, nthList, checkingTag) {
    var _ASN1HEX = ASN1HEX;
    var idx = _ASN1HEX.getIdxbyListEx(h, currentIndex, nthList, checkingTag);
    if (idx == -1) return null;
    return _ASN1HEX.getTLV(h, idx);
};

/**
 * get ASN.1 value by nthList<br/>
 * @name getVbyList
 * @memberOf ASN1HEX
 * @function
 * @param {String} h hexadecimal string of ASN.1 structure
 * @param {Integer} currentIndex string index to start searching in hexadecimal string "h"
 * @param {Array} nthList array of nth list index
 * @param {String} checkingTag (OPTIONAL) string of expected ASN.1 tag for nthList 
 * @param {Boolean} removeUnusedbits (OPTIONAL) flag for remove first byte for value (DEFAULT false)
 * @return {String} referred hexadecimal string of ASN.1 value(V) or null
 * @since asn1hex 1.1.4
 * @see ASN1HEX.getIdxbyList
 * @see ASN1HEX.getVbyListEx
 *
 * @description
 * This static method is to get a ASN.1 value which specified "nthList" position
 * with checking expected tag "checkingTag".
 * <br/>
 * When referring value can't be found, this returns null.
 * <br/>
 * NOTE: 'removeUnusedbits' flag has been supported since
 * jsrsasign 7.1.14 asn1hex 1.1.10.
 */
ASN1HEX.getVbyList = function(h, currentIndex, nthList, checkingTag, removeUnusedbits) {
    var _ASN1HEX = ASN1HEX;
    var idx, v;
    idx = _ASN1HEX.getIdxbyList(h, currentIndex, nthList, checkingTag);
    
    if (idx == -1) return null;
    if (idx >= h.length) return null;

    v = _ASN1HEX.getV(h, idx);
    if (removeUnusedbits === true) v = v.substr(2);
    return v;
};

/**
 * get ASN.1 V by nthList<br/>
 * @name getVbyListEx
 * @memberOf ASN1HEX
 * @function
 * @param {String} h hexadecimal string of ASN.1 structure
 * @param {Integer} currentIndex string index to start searching in hexadecimal string "h"
 * @param {Array of Object} nthList array list of nth index value or context specific tag string (ex. "[0]")
 * @param {String} checkingTag (OPTIONAL) string of expected ASN.1 tag for nthList (default is undefined)
 * @param {Boolean} removeUnusedbits (OPTIONAL) flag for trim unused bit from result value (default is undefined)
 * @return {String} hexadecimal ASN.1 V string refered by nthList. return null if not found
 * @since jsrsasign 8.0.21 asn1hex 1.2.2
 * @see <a href="https://github.com/kjur/jsrsasign/wiki/Tutorial-for-accessing-deep-inside-of-ASN.1-structure-by-using-new-ASN1HEX.getIdxbyListEx">ASN1HEX.getIdxbyListEx tutorial wiki page</a>
 * @see {@link ASN1HEX.getIdxbyListEx}
 *
 * @description
 * This static method is to get a ASN.1 value which specified "nthList" position
 * with checking expected tag "checkingTag".
 * This method can dig into ASN.1 object encapsulated by
 * OctetString or BitString with unused bits.
 *
 * @example
 * 3014 seq idx=0
 *   3012 seq idx=4
 *     020101 int:1 idx=8
 *     020102 int:2 idx=14
 *     800103 [0]:3 idx=20
 *     810104 [1]:4 idx=26
 *     020105 int:5 idx=32
 *     020106 int:6 idx=38
 * h = "30140412020101020102800103810104020105020106";
 * ASN1HEX.getTLVbyList(h, 0, [0, "[0]"]) &rarr; 03
 * ASN1HEX.getTLVbyList(h, 0, [0, 2]) &rarr; 05
 * ASN1HEX.getTLVbyList(h, 0, [0, 2], "0c") &rarr; null //not UTF8String(0c)
 */
ASN1HEX.getVbyListEx = function(h, currentIndex, nthList, checkingTag, removeUnusedbits) {
    var _ASN1HEX = ASN1HEX;
    var idx, tlv, v;
    idx = _ASN1HEX.getIdxbyListEx(h, currentIndex, nthList, checkingTag);
    if (idx == -1) return null;
    v = _ASN1HEX.getV(h, idx);
    if (h.substr(idx, 2) == "03" && removeUnusedbits !== false) v = v.substr(2);
    return v;
};

/**
 * get integer value from ASN.1 V(value) of Integer or BitString<br/>
 * @name getInt
 * @memberOf ASN1HEX
 * @function
 * @param {String} h hexadecimal string
 * @param {Number} idx string index in h to get ASN.1 DER Integer or BitString
 * @param {Object} errorReturn (OPTION) error return value (DEFAULT: -1)
 * @return {Number} ASN.1 DER Integer or BitString value
 * @since jsrsasign 10.1.0 asn1hex 1.2.7
 * @see bitstrtoint
 *
 * @example
 * ASN1HEX.getInt("xxxx020103xxxxxx", 4) &rarr 3 // DER Integer
 * ASN1HEX.getInt("xxxx03020780xxxxxx", 4) &rarr 1 // DER BitStringx
 * ASN1HEX.getInt("xxxx030203c8xxxxxx", 4) &rarr 25 // DER BitStringx
 */
ASN1HEX.getInt = function(h, idx, errorReturn) {
    if (errorReturn == undefined) errorReturn = -1;
    try {
	var hTag = h.substr(idx, 2);
	if (hTag != "02" && hTag != "03") return errorReturn;
	var hV = ASN1HEX.getV(h, idx);
	if (hTag == "02") {
	    return parseInt(hV, 16);
	} else {
	    return bitstrtoint(hV);
	}
    } catch(ex) {
	return errorReturn;
    }
};

/**
 * get object identifier string from ASN.1 V(value)<br/>
 * @name getOID
 * @memberOf ASN1HEX
 * @function
 * @param {String} h hexadecimal string
 * @param {Number} idx string index in h to get ASN.1 DER ObjectIdentifier
 * @param {Object} errorReturn (OPTION) error return value (DEFAULT: null)
 * @return {String} object identifier string (ex. "1.2.3.4")
 * @since jsrsasign 10.1.0 asn1hex 1.2.7
 *
 * @example
 * ASN1HEX.getInt("xxxx06032a0304xxxxxx", 4) &rarr "1.2.3.4"
 */
ASN1HEX.getOID = function(h, idx, errorReturn) {
    if (errorReturn == undefined) errorReturn = null;
    try {
	if (h.substr(idx, 2) != "06") return errorReturn;
	var hOID = ASN1HEX.getV(h, idx);
	return hextooid(hOID);
    } catch(ex) {
	return errorReturn;
    }
};

/**
 * get object identifier name from ASN.1 V(value)<br/>
 * @name getOIDName
 * @memberOf ASN1HEX
 * @function
 * @param {String} h hexadecimal string
 * @param {Number} idx string index in h to get ASN.1 DER ObjectIdentifier
 * @param {Object} errorReturn (OPTION) error return value (DEFAULT: null)
 * @return {String} object identifier name (ex. "sha256") oir OID string
 * @since jsrsasign 10.1.0 asn1hex 1.2.7
 *
 * @description
 * This static method returns object identifier name such as "sha256"
 * if registered. If not registered, it returns OID string. 
 * (ex. "1.2.3.4")
 *
 * @example
 * ASN1HEX.getOIDName("xxxx0609608648016503040201xxxxxx", 4) &rarr "sha256"
 * ASN1HEX.getOIDName("xxxx06032a0304xxxxxx", 4) &rarr "1.2.3.4"
 */
ASN1HEX.getOIDName = function(h, idx, errorReturn) {
    if (errorReturn == undefined) errorReturn = null;
    try {
	var oid = ASN1HEX.getOID(h, idx, errorReturn);
	if (oid == errorReturn) return errorReturn;
	var name = KJUR.asn1.x509.OID.oid2name(oid);
	if (name == '') return oid;
	return name;
    } catch(ex) {
	return errorReturn;
    }
};

/**
 * get raw string from ASN.1 V(value)<br/>
 * @name getString
 * @memberOf ASN1HEX
 * @function
 * @param {String} h hexadecimal string
 * @param {Number} idx string index in h to get any ASN.1 DER String
 * @param {Object} errorReturn (OPTION) error return value (DEFAULT: null)
 * @return {String} raw string
 * @since jsrsasign 10.1.3 asn1hex 1.2.8
 *
 * @description
 * This static method returns a raw string from
 * any ASN.1 DER primitives.
 *
 * @example
 * ASN1HEX.getString("xxxx1303616161xxxxxx", 4) &rarr "aaa"
 * ASN1HEX.getString("xxxx0c03616161xxxxxx", 4) &rarr "aaa"
 */
ASN1HEX.getString = function(h, idx, errorReturn) {
    if (errorReturn == undefined) errorReturn = null;
    try {
	var hV = ASN1HEX.getV(h, idx);
	return hextorstr(hV);
    } catch(ex) {
	return errorReturn;
    }
};

/**
 * get OID string from hexadecimal encoded value<br/>
 * @name hextooidstr
 * @memberOf ASN1HEX
 * @function
 * @param {String} hex hexadecmal string of ASN.1 DER encoded OID value
 * @return {String} OID string (ex. '1.2.3.4.567')
 * @since asn1hex 1.1.5
 * @see {@link KJUR.asn1.ASN1Util.oidIntToHex}
 * @description
 * This static method converts from ASN.1 DER encoded 
 * hexadecimal object identifier value to dot concatinated OID value.
 * {@link KJUR.asn1.ASN1Util.oidIntToHex} is a reverse function of this.
 * @example
 * ASN1HEX.hextooidstr("550406") &rarr; "2.5.4.6"
 */
ASN1HEX.hextooidstr = function(hex) {
    var zeroPadding = function(s, len) {
        if (s.length >= len) return s;
        return new Array(len - s.length + 1).join('0') + s;
    };

    var a = [];

    // a[0], a[1]
    var hex0 = hex.substr(0, 2);
    var i0 = parseInt(hex0, 16);
    a[0] = new String(Math.floor(i0 / 40));
    a[1] = new String(i0 % 40);

    // a[2]..a[n]
   var hex1 = hex.substr(2);
    var b = [];
    for (var i = 0; i < hex1.length / 2; i++) {
    b.push(parseInt(hex1.substr(i * 2, 2), 16));
    }
    var c = [];
    var cbin = "";
    for (var i = 0; i < b.length; i++) {
        if (b[i] & 0x80) {
            cbin = cbin + zeroPadding((b[i] & 0x7f).toString(2), 7);
        } else {
            cbin = cbin + zeroPadding((b[i] & 0x7f).toString(2), 7);
            c.push(new String(parseInt(cbin, 2)));
            cbin = "";
        }
    }

    var s = a.join(".");
    if (c.length > 0) s = s + "." + c.join(".");
    return s;
};

/**
 * get string of simple ASN.1 dump from hexadecimal ASN.1 data<br/>
 * @name dump
 * @memberOf ASN1HEX
 * @function
 * @param {Object} hexOrObj hexadecmal string of ASN.1 data or ASN1Object object
 * @param {Array} flags associative array of flags for dump (OPTION)
 * @param {Number} idx string index for starting dump (OPTION)
 * @param {String} indent indent string (OPTION)
 * @return {String} string of simple ASN.1 dump
 * @since jsrsasign 4.8.3 asn1hex 1.1.6
 * @description
 * This method will get an ASN.1 dump from
 * hexadecmal string of ASN.1 DER encoded data.
 * Here are features:
 * <ul>
 * <li>ommit long hexadecimal string</li>
 * <li>dump encapsulated OCTET STRING (good for X.509v3 extensions)</li>
 * <li>structured/primitive context specific tag support (i.e. [0], [3] ...)</li>
 * <li>automatic decode for implicit primitive context specific tag 
 * (good for X.509v3 extension value)
 *   <ul>
 *   <li>if hex starts '68747470'(i.e. http) it is decoded as utf8 encoded string.</li>
 *   <li>if it is in 'subjectAltName' extension value and is '[2]'(dNSName) tag
 *   value will be encoded as utf8 string</li>
 *   <li>otherwise it shows as hexadecimal string</li>
 *   </ul>
 * </li>
 * </ul>
 * NOTE1: Argument {@link KJUR.asn1.ASN1Object} object is supported since
 * jsrsasign 6.2.4 asn1hex 1.0.8
 * @example
 * // 1) ASN.1 INTEGER
 * ASN1HEX.dump('0203012345')
 * &darr;
 * INTEGER 012345
 *
 * // 2) ASN.1 Object Identifier
 * ASN1HEX.dump('06052b0e03021a')
 * &darr;
 * ObjectIdentifier sha1 (1 3 14 3 2 26)
 *
 * // 3) ASN.1 SEQUENCE
 * ASN1HEX.dump('3006020101020102')
 * &darr;
 * SEQUENCE
 *   INTEGER 01
 *   INTEGER 02
 *
 * // 4) ASN.1 SEQUENCE since jsrsasign 6.2.4
 * o = KJUR.asn1.ASN1Util.newObject({seq: [{int: 1}, {int: 2}]});
 * ASN1HEX.dump(o)
 * &darr;
 * SEQUENCE
 *   INTEGER 01
 *   INTEGER 02
 * // 5) ASN.1 DUMP FOR X.509 CERTIFICATE
 * ASN1HEX.dump(pemtohex(certPEM))
 * &darr;
 * SEQUENCE
 *   SEQUENCE
 *     [0]
 *       INTEGER 02
 *     INTEGER 0c009310d206dbe337553580118ddc87
 *     SEQUENCE
 *       ObjectIdentifier SHA256withRSA (1 2 840 113549 1 1 11)
 *       NULL
 *     SEQUENCE
 *       SET
 *         SEQUENCE
 *           ObjectIdentifier countryName (2 5 4 6)
 *           PrintableString 'US'
 *             :
 */
ASN1HEX.dump = function(hexOrObj, flags, idx, indent) {
    var _ASN1HEX = ASN1HEX;
    var _getV = _ASN1HEX.getV;
    var _dump = _ASN1HEX.dump;
    var _getChildIdx = _ASN1HEX.getChildIdx;

    var hex = hexOrObj;
    if (hexOrObj instanceof KJUR.asn1.ASN1Object)
	hex = hexOrObj.tohex();

    var _skipLongHex = function(hex, limitNumOctet) {
	if (hex.length <= limitNumOctet * 2) {
	    return hex;
	} else {
	    var s = hex.substr(0, limitNumOctet) + 
		    "..(total " + hex.length / 2 + "bytes).." +
		    hex.substr(hex.length - limitNumOctet, limitNumOctet);
	    return s;
	};
    };

    if (flags === undefined) flags = { "ommit_long_octet": 32 };
    if (idx === undefined) idx = 0;
    if (indent === undefined) indent = "";
    var skipLongHex = flags.ommit_long_octet;

    var tag = hex.substr(idx, 2);

    if (tag == "01") {
	var v = _getV(hex, idx);
	if (v == "00") {
	    return indent + "BOOLEAN FALSE\n";
	} else {
	    return indent + "BOOLEAN TRUE\n";
	}
    }
    if (tag == "02") {
	var v = _getV(hex, idx);
        return indent + "INTEGER " + _skipLongHex(v, skipLongHex) + "\n";
    }
    if (tag == "03") {
	var v = _getV(hex, idx);
	if (_ASN1HEX.isASN1HEX(v.substr(2))) {
  	    var s = indent + "BITSTRING, encapsulates\n";
            s = s + _dump(v.substr(2), flags, 0, indent + "  ");
            return s;
	} else {
            return indent + "BITSTRING " + _skipLongHex(v, skipLongHex) + "\n";
	}
    }
    if (tag == "04") {
	var v = _getV(hex, idx);
	if (_ASN1HEX.isASN1HEX(v)) {
	    var s = indent + "OCTETSTRING, encapsulates\n";
	    s = s + _dump(v, flags, 0, indent + "  ");
	    return s;
	} else {
	    return indent + "OCTETSTRING " + _skipLongHex(v, skipLongHex) + "\n";
	}
    }
    if (tag == "05") {
	return indent + "NULL\n";
    }
    if (tag == "06") {
	var hV = _getV(hex, idx);
        var oidDot = KJUR.asn1.ASN1Util.oidHexToInt(hV);
        var oidName = KJUR.asn1.x509.OID.oid2name(oidDot);
	var oidSpc = oidDot.replace(/\./g, ' ');
        if (oidName != '') {
  	    return indent + "ObjectIdentifier " + oidName + " (" + oidSpc + ")\n";
	} else {
  	    return indent + "ObjectIdentifier (" + oidSpc + ")\n";
	}
    }
    if (tag == "0a") {
	return indent + "ENUMERATED " + parseInt(_getV(hex, idx)) + "\n";
    }
    if (tag == "0c") {
	return indent + "UTF8String '" + hextoutf8(_getV(hex, idx)) + "'\n";
    }
    if (tag == "13") {
	return indent + "PrintableString '" + hextoutf8(_getV(hex, idx)) + "'\n";
    }
    if (tag == "14") {
	return indent + "TeletexString '" + hextoutf8(_getV(hex, idx)) + "'\n";
    }
    if (tag == "16") {
	return indent + "IA5String '" + hextoutf8(_getV(hex, idx)) + "'\n";
    }
    if (tag == "17") {
	return indent + "UTCTime " + hextoutf8(_getV(hex, idx)) + "\n";
    }
    if (tag == "18") {
	return indent + "GeneralizedTime " + hextoutf8(_getV(hex, idx)) + "\n";
    }
    if (tag == "1a") {
	return indent + "VisualString '" + hextoutf8(_getV(hex, idx)) + "'\n";
    }
    if (tag == "1e") {
	return indent + "BMPString '" + ucs2hextoutf8(_getV(hex, idx)) + "'\n";
    }
    if (tag == "30") {
	if (hex.substr(idx, 4) == "3000") {
	    return indent + "SEQUENCE {}\n";
	}

	var s = indent + "SEQUENCE\n";
	var aIdx = _getChildIdx(hex, idx);

	var flagsTemp = flags;
	
	if ((aIdx.length == 2 || aIdx.length == 3) &&
	    hex.substr(aIdx[0], 2) == "06" &&
	    hex.substr(aIdx[aIdx.length - 1], 2) == "04") { // supposed X.509v3 extension
	    var oidName = _ASN1HEX.oidname(_getV(hex, aIdx[0]));
	    var flagsClone = JSON.parse(JSON.stringify(flags));
	    flagsClone.x509ExtName = oidName;
	    flagsTemp = flagsClone;
	}
	
	for (var i = 0; i < aIdx.length; i++) {
	    s = s + _dump(hex, flagsTemp, aIdx[i], indent + "  ");
	}
	return s;
    }
    if (tag == "31") {
	var s = indent + "SET\n";
	var aIdx = _getChildIdx(hex, idx);
	for (var i = 0; i < aIdx.length; i++) {
	    s = s + _dump(hex, flags, aIdx[i], indent + "  ");
	}
	return s;
    }
    var tag = parseInt(tag, 16);
    if ((tag & 128) != 0) { // context specific 
	var tagNumber = tag & 31;
	if ((tag & 32) != 0) { // structured tag
	    var s = indent + "[" + tagNumber + "]\n";
	    var aIdx = _getChildIdx(hex, idx);
	    for (var i = 0; i < aIdx.length; i++) {
		s = s + _dump(hex, flags, aIdx[i], indent + "  ");
	    }
	    return s;
	} else { // primitive tag
	    var v = _getV(hex, idx);
	    if (ASN1HEX.isASN1HEX(v)) {
		var s = indent + "[" + tagNumber + "]\n";
		s = s + _dump(v, flags, 0, indent + "  ");
		return s;
	    } else if (v.substr(0, 8) == "68747470") { // http
		v = hextoutf8(v);
	    } else if (flags.x509ExtName === "subjectAltName" &&
		       tagNumber == 2) {
		v = hextoutf8(v);
	    }
	    // else if (ASN1HEX.isASN1HEX(v))

	    var s = indent + "[" + tagNumber + "] " + v + "\n";
	    return s;
	}
    }
    return indent + "UNKNOWN(" + tag + ") " + 
	   _getV(hex, idx) + "\n";
};

/**
 * parse ASN.1 DER hexadecimal string<br/>
 * @name parse
 * @memberOf ASN1HEX
 * @function
 * @param {String} h hexadecimal string of ASN1. DER
 * @return {Object} associative array of ASN.1 parsed result
 * @since jsrsasign 10.5.3 asn1hex 1.1.x
 * @see KJUR.asn1.ASN1Util.newOjbect
 *
 * @description
 * This method parses ASN.1 DER hexadecimal string.
 * Its result can be applied to {@link KJUR.asn1.ASN1Util.newOjbect}.
 *
 * @example
 * ASN1HEX.parse("31193017...") &rarr; // RDN
 * {set: [{seq: [{oid: "localityName"}, {utf8str: {str: "Test"}}] }]}
 */
ASN1HEX.parse = function(h) {
    var _ASN1HEX = ASN1HEX,
	_parse = _ASN1HEX.parse,
	_isASN1HEX = _ASN1HEX.isASN1HEX,
	_getV = _ASN1HEX.getV,
	_getTLV = _ASN1HEX.getTLV,
	_getChildIdx = _ASN1HEX.getChildIdx,
	_KJUR_asn1 = KJUR.asn1,
	_oidHexToInt = _KJUR_asn1.ASN1Util.oidHexToInt,
	_oid2name = _KJUR_asn1.x509.OID.oid2name,
	_hextoutf8 = hextoutf8,
	_ucs2hextoutf8 = ucs2hextoutf8,
	_iso88591hextoutf8 = iso88591hextoutf8;

    var tagName = {
	"0c": "utf8str", "12": "numstr", "13": "prnstr", 
	"14": "telstr", "16": "ia5str", "17": "utctime", 
	"18": "gentime", "1a": "visstr", "1e": "bmpstr", 
	"30": "seq", "31": "set"
    };

    var _parseChild = function(h) {
	var result = [];
	var aIdx = _getChildIdx(h, 0);
	for (var i = 0; i < aIdx.length; i++) {
	    var idx = aIdx[i];
	    var hTLV = _getTLV(h, idx);
	    var pItem = _parse(hTLV);
	    result.push(pItem);
	}
	return result;
    };

    var tag = h.substr(0, 2);
    var result = {};
    var hV = _getV(h, 0);
    if (tag == "01") {
	if (h == "0101ff") return {bool: true};
	return {bool: false};
    } else if (tag == "02") {
	return {"int": {hex: hV}};
    } else if (tag == "03") {
	try {
	    if (hV.substr(0, 2) != "00") throw "not encap";
	    var hV1 = hV.substr(2);
	    if (! _isASN1HEX(hV1)) throw "not encap";
	    return {bitstr: {obj: _parse(hV1)}};
	} catch(ex) {
	    var bV = null;
	    if (hV.length <= 10) bV = bitstrtobinstr(hV);
	    if (bV == null) {
		return {bitstr: {hex: hV}};
	    } else {
		return {bitstr: {bin: bV}};
	    }
	}
    } else if (tag == "04") {
	try {
	    if (! _isASN1HEX(hV)) throw "not encap";
	    return {octstr: {obj: _parse(hV)}};
	} catch(ex) {
	    return {octstr: {hex: hV}};
	}
    } else if (tag == "05") {
	return {"null": ''};
    } else if (tag == "06") {
	var oidDot = _oidHexToInt(hV);
	var oidName = _oid2name(oidDot);
	if (oidName == "") {
	    return {oid: oidDot};
	} else {
	    return {oid: oidName};
	}
    } else if (tag == "0a") {
	if (hV.length > 4) {
	    return {"enum": {hex: hV}};
	} else {
	    return {"enum": parseInt(hV, 16)};
	}
    } else if (tag == "30" || tag == "31") {
	result[tagName[tag]] = _parseChild(h);
	return result;
    } else if (tag == "14") { // TeletexString
	var s = _iso88591hextoutf8(hV);
	result[tagName[tag]] = {str: s};
	return result;
    } else if (tag == "1e") { // BMPString
	var s = _ucs2hextoutf8(hV);
	result[tagName[tag]] = {str: s};
	return result;
    } else if (":0c:12:13:16:17:18:1a:".indexOf(tag) != -1) { // Other Strings types
	var s = _hextoutf8(hV);
	result[tagName[tag]] = {str: s};
	return result;
    } else if (tag.match(/^8[0-9]$/)) {
	var s = _hextoutf8(hV);
	if (s == null | s == "") {
	    return {"tag": {"tag": tag, explicit: false, hex: hV}};
	} else if (s.match(/[\x00-\x1F\x7F-\x9F]/) != null ||
		   s.match(/[\u0000-\u001F\u0080–\u009F]/) != null) {
	    return {"tag": {"tag": tag, explicit: false, hex: hV}};
	} else {
	    return {"tag": {"tag": tag, explicit: false, str: s}};
	}
    } else if (tag.match(/^a[0-9]$/)) {
	try {
	    if (! _isASN1HEX(hV)) throw new Error("not encap");
	    return {"tag": {"tag": tag, 
			    explicit: true,
			    obj: _parse(hV)}};
	} catch(ex) {
	    return {"tag": {"tag": tag, explicit: true, hex: hV}};
	}
    } else {
	var d = new KJUR.asn1.ASN1Object();
	d.hV = hV;
	var hL = d.getLengthHexFromValue();
	return {"asn1": {"tlv": tag + hL + hV}};
    }
};

/**
 * check if a hexadecimal tag is a specified ASN.1 context specific tag
 * @name isContextTag
 * @memberOf ASN1HEX
 * @function
 * @param {hTag} hex string of a hexadecimal ASN.1 tag consists by two characters (e.x. "a0")
 * @param {sTag} context specific tag in string represention (OPTION) (e.x. "[0]")
 * @return {Boolean} true if hTag is a ASN.1 context specific tag specified by sTag value.
 * @since jsrsasign 8.0.21 asn1hex 1.2.2
 * @description
 * This method checks if a hexadecimal tag is a specified ASN.1 context specific tag.
 * Structured and non-structured type of tag have the same string representation
 * of context specific tag. For example tag "a0" and "80" have the same string
 * representation "[0]".
 * The sTag has a range from from "[0]" to "[31]".
 * @example
 * ASN1HEX.isContextTag('a0', '[0]') &rarr; true // structured
 * ASN1HEX.isContextTag('a1', '[1]') &rarr; true // structured
 * ASN1HEX.isContextTag('a2', '[2]') &rarr; true // structured
 * ASN1HEX.isContextTag('80', '[0]') &rarr; true // non structured
 * ASN1HEX.isContextTag('81', '[1]') &rarr; true // non structured
 * ASN1HEX.isContextTag('82', '[2]') &rarr; true // non structured
 * ASN1HEX.isContextTag('a0', '[3]') &rarr; false
 * ASN1HEX.isContextTag('80', '[15]') &rarr; false
 *
 * ASN.1 tag bits
 * 12345679
 * ++        tag class(universal:00, context specific:10)
 *   +       structured:1, primitive:0
 *    +++++  tag number (0 - 31)
 */
ASN1HEX.isContextTag = function(hTag, sTag) {
    hTag = hTag.toLowerCase();
    var ihtag, istag;

    try {
	ihtag = parseInt(hTag, 16);
    } catch (ex) {
	return -1;
    }
	
    if (sTag === undefined) {
	if ((ihtag & 192) == 128) {
	    return true;
	} else {
	    return false;
	}
    }

    try {
	var result = sTag.match(/^\[[0-9]+\]$/);
	if (result == null) return false;
	istag = parseInt(sTag.substr(1,sTag.length - 1), 10);
	if (istag > 31) return false;
	if (((ihtag & 192) == 128) &&   // ihtag & b11000000 == b10000000
	    ((ihtag & 31) == istag)) {  // ihtag & b00011111 == istag (0-31)
	    return true;
	}
	return false;
    } catch (ex) {
	return false;
    }
};

/**
 * simple ASN.1 DER hexadecimal string checker<br/>
 * @name isASN1HEX
 * @memberOf ASN1HEX
 * @function
 * @param {String} hex string to check whether it is hexadecmal string for ASN.1 DER or not
 * @return {Boolean} true if it is hexadecimal string of ASN.1 data otherwise false
 * @since jsrsasign 4.8.3 asn1hex 1.1.6
 * @description
 * This method checks wheather the argument 'hex' is a hexadecimal string of
 * ASN.1 data or not.
 * @example
 * ASN1HEX.isASN1HEX('0203012345') &rarr; true // PROPER ASN.1 INTEGER
 * ASN1HEX.isASN1HEX('0203012345ff') &rarr; false // TOO LONG VALUE
 * ASN1HEX.isASN1HEX('02030123') &rarr; false // TOO SHORT VALUE
 * ASN1HEX.isASN1HEX('fa3bcd') &rarr; false // WRONG FOR ASN.1
 */
ASN1HEX.isASN1HEX = function(hex) {
    var _ASN1HEX = ASN1HEX;
    if (hex.length % 2 == 1) return false;

    var intL = _ASN1HEX.getVblen(hex, 0);
    var hT = hex.substr(0, 2);
    var hL = _ASN1HEX.getL(hex, 0);
    var hVLength = hex.length - hT.length - hL.length;
    if (hVLength == intL * 2) return true;

    return false;
};

/**
 * strict ASN.1 DER hexadecimal string checker
 * @name checkStrictDER
 * @memberOf ASN1HEX
 * @function
 * @param {String} hex string to check whether it is hexadecmal string for ASN.1 DER or not
 * @return unspecified
 * @since jsrsasign 8.0.19 asn1hex 1.2.1
 * @throws Error when malformed ASN.1 DER hexadecimal string
 * @description
 * This method checks wheather the argument 'hex' is a hexadecimal string of
 * ASN.1 data or not. If the argument is not DER string, this 
 * raise an exception.
 * @example
 * ASN1HEX.checkStrictDER('0203012345') &rarr; NO EXCEPTION FOR PROPER ASN.1 INTEGER
 * ASN1HEX.checkStrictDER('0203012345ff') &rarr; RAISE EXCEPTION FOR TOO LONG VALUE
 * ASN1HEX.checkStrictDER('02030123') &rarr; false RAISE EXCEPITON FOR TOO SHORT VALUE
 * ASN1HEX.checkStrictDER('fa3bcd') &rarr; false RAISE EXCEPTION FOR WRONG ASN.1
 */
ASN1HEX.checkStrictDER = function(h, idx, maxHexLen, maxByteLen, maxLbyteLen) {
    var _ASN1HEX = ASN1HEX;

    if (maxHexLen === undefined) {
	// 1. hex string check
	if (typeof h != "string") throw new Error("not hex string");
	h = h.toLowerCase();
	if (! KJUR.lang.String.isHex(h)) throw new Error("not hex string");

	// 2. set max if needed
	// max length of hexadecimal string
	maxHexLen = h.length;
	// max length of octets
	maxByteLen = h.length / 2;
	// max length of L octets of TLV
	if (maxByteLen < 0x80) {
	    maxLbyteLen = 1;
	} else {
	    maxLbyteLen = Math.ceil(maxByteLen.toString(16)) + 1;
	}
    }
    //console.log(maxHexLen + ":" + maxByteLen + ":" + maxLbyteLen);

    // 3. check if L(length) string not exceeds maxLbyteLen
    var hL = _ASN1HEX.getL(h, idx);
    if (hL.length > maxLbyteLen * 2)
	throw new Error("L of TLV too long: idx=" + idx);

    // 4. check if V(value) octet length (i.e. L(length) value) 
    //    not exceeds maxByteLen
    var vblen = _ASN1HEX.getVblen(h, idx);
    if (vblen > maxByteLen) 
	throw new Error("value of L too long than hex: idx=" + idx);

    // 5. check V string length and L's value are the same
    var hTLV = _ASN1HEX.getTLV(h, idx);
    var hVLength = 
	hTLV.length - 2 - _ASN1HEX.getL(h, idx).length;
    if (hVLength !== (vblen * 2))
	throw new Error("V string length and L's value not the same:" +
		        hVLength + "/" + (vblen * 2));

    // 6. check appending garbled string
    if (idx === 0) {
	if (h.length != hTLV.length)
	    throw new Error("total length and TLV length unmatch:" +
			    h.length + "!=" + hTLV.length);
    }

    // 7. check if there isn't prepending zeros in DER INTEGER value
    var hT = h.substr(idx, 2);
    if (hT === '02') {
	var vidx = _ASN1HEX.getVidx(h, idx);
	// check if DER INTEGER VALUE have least leading zeros 
	// for two's complement
	// GOOD - 3fabde... 008fad...
	// BAD  - 000012... 007fad...
	if (h.substr(vidx, 2) == "00" && h.charCodeAt(vidx + 2) < 56) // '8'=56
	    throw new Error("not least zeros for DER INTEGER");
    }

    // 8. check if all of elements in a structured item are conformed to
    //    strict DER encoding rules.
    if (parseInt(hT, 16) & 32) { // structured tag?
	var intL = _ASN1HEX.getVblen(h, idx);
	var sum = 0;
	var aIdx = _ASN1HEX.getChildIdx(h, idx);
	for (var i = 0; i < aIdx.length; i++) {
	    var tlv = _ASN1HEX.getTLV(h, aIdx[i]);
	    sum += tlv.length;
	    _ASN1HEX.checkStrictDER(h, aIdx[i], 
				   maxHexLen, maxByteLen, maxLbyteLen);
	}
	if ((intL * 2) != sum)
	    throw new Error("sum of children's TLV length and L unmatch: " +
			    (intL * 2) + "!=" + sum);
    }
};

/**
 * get hexacedimal string from PEM format data<br/>
 * @name oidname
 * @memberOf ASN1HEX
 * @function
 * @param {String} oidDotOrHex number dot notation(i.e. 1.2.3) or hexadecimal string for OID
 * @return {String} name for OID
 * @since jsrsasign 7.2.0 asn1hex 1.1.11
 * @description
 * This static method gets a OID name for
 * a specified string of number dot notation (i.e. 1.2.3) or
 * hexadecimal string.
 * @example
 * ASN1HEX.oidname("2.5.29.37") &rarr; extKeyUsage
 * ASN1HEX.oidname("551d25") &rarr; extKeyUsage
 * ASN1HEX.oidname("0.1.2.3") &rarr; 0.1.2.3 // unknown
 */
ASN1HEX.oidname = function(oidDotOrHex) {
    var _KJUR_asn1 = KJUR.asn1;
    if (KJUR.lang.String.isHex(oidDotOrHex))
	oidDotOrHex = _KJUR_asn1.ASN1Util.oidHexToInt(oidDotOrHex);
    var name = _KJUR_asn1.x509.OID.oid2name(oidDotOrHex);
    if (name === "") name = oidDotOrHex;
    return name;
};


/* base64x-1.1.30 (c) 2012-2022 Kenji Urushima | kjur.github.io/jsrsasign/license
 */
/*
 * base64x.js - Base64url and supplementary functions for Tom Wu's base64.js library
 *
 * Copyright (c) 2012-2022 Kenji Urushima (kenji.urushima@gmail.com)
 *
 * This software is licensed under the terms of the MIT License.
 * https://kjur.github.io/jsrsasign/license
 *
 * The above copyright and license notice shall be 
 * included in all copies or substantial portions of the Software.
 */

/**
 * @fileOverview
 * @name base64x-1.1.js
 * @author Kenji Urushima kenji.urushima@gmail.com
 * @version jsrsasign 10.5.25 base64x 1.1.30 (2022-Jun-23)
 * @since jsrsasign 2.1
 * @license <a href="https://kjur.github.io/jsrsasign/license/">MIT License</a>
 */

var KJUR;
if (typeof KJUR == "undefined" || !KJUR) KJUR = {};
if (typeof KJUR.lang == "undefined" || !KJUR.lang) KJUR.lang = {};

/**
 * String and its utility class <br/>
 * This class provides some static utility methods for string.
 * @class String and its utility class
 * @author Kenji Urushima
 * @version 1.0 (2016-Aug-05)
 * @since base64x 1.1.7 jsrsasign 5.0.13
 * @description
 * <br/>
 * This class provides static methods for string utility.
 * <dl>
 * <dt><b>STRING TYPE CHECKERS</b>
 * <dd>
 * <ul>
 * <li>{@link KJUR.lang.String.isInteger} - check whether argument is an integer</li>
 * <li>{@link KJUR.lang.String.isHex} - check whether argument is a hexadecimal string</li>
 * <li>{@link KJUR.lang.String.isBase64} - check whether argument is a Base64 encoded string</li>
 * <li>{@link KJUR.lang.String.isBase64URL} - check whether argument is a Base64URL encoded string</li>
 * <li>{@link KJUR.lang.String.isIntegerArray} - check whether argument is an array of integers</li>
 * <li>{@link KJUR.lang.String.isPrintable} - check whether argument is PrintableString accepted characters</li>
 * <li>{@link KJUR.lang.String.isIA5} - check whether argument is IA5String accepted characters</li>
 * <li>{@link KJUR.lang.String.isMail} - check whether argument is RFC 822 e-mail address format</li>
 * </ul>
 * </dl>
 */
KJUR.lang.String = function() {};

/**
 * Base64URL and supplementary functions for Tom Wu's base64.js library.<br/>
 * This class is just provide information about global functions
 * defined in 'base64x.js'. The 'base64x.js' script file provides
 * global functions for converting following data each other.
 * <ul>
 * <li>(ASCII) String</li>
 * <li>UTF8 String including CJK, Latin and other characters</li>
 * <li>byte array</li>
 * <li>hexadecimal encoded String</li>
 * <li>Full URIComponent encoded String (such like "%69%94")</li>
 * <li>Base64 encoded String</li>
 * <li>Base64URL encoded String</li>
 * </ul>
 * All functions in 'base64x.js' are defined in {@link _global_} and not
 * in this class.
 * 
 * @class Base64URL and supplementary functions for Tom Wu's base64.js library
 * @author Kenji Urushima
 * @version 1.1 (07 May 2012)
 * @requires base64.js
 * @see <a href="https://kjur.github.io/jsjws/">'jwjws'(JWS JavaScript Library) home page https://kjur.github.io/jsjws/</a>
 * @see <a href="https://kjur.github.io/jsrsasigns/">'jwrsasign'(RSA Sign JavaScript Library) home page https://kjur.github.io/jsrsasign/</a>
 */
function Base64x() {
}

// ==== string / byte array ================================
/**
 * convert a string to an array of character codes
 * @name stoBA
 * @function
 * @param {String} s
 * @return {Array of Numbers} 
 */
function stoBA(s) {
    var a = new Array();
    for (var i = 0; i < s.length; i++) {
	a[i] = s.charCodeAt(i);
    }
    return a;
}

/**
 * convert an array of character codes to a string
 * @name BAtos
 * @function
 * @param {Array of Numbers} a array of character codes
 * @return {String} s
 */
function BAtos(a) {
    var s = "";
    for (var i = 0; i < a.length; i++) {
	s = s + String.fromCharCode(a[i]);
    }
    return s;
}

// ==== byte array / hex ================================
/**
 * convert an array of bytes(Number) to hexadecimal string.<br/>
 * @name BAtohex
 * @function
 * @param {Array of Numbers} a array of bytes
 * @return {String} hexadecimal string
 */
function BAtohex(a) {
    var s = "";
    for (var i = 0; i < a.length; i++) {
	var hex1 = a[i].toString(16);
	if (hex1.length == 1) hex1 = "0" + hex1;
	s = s + hex1;
    }
    return s;
}

// ==== string / hex ================================
/**
 * convert a ASCII string to a hexadecimal string of ASCII codes.<br/>
 * NOTE: This can't be used for non ASCII characters.
 * @name stohex
 * @function
 * @param {s} s ASCII string
 * @return {String} hexadecimal string
 */
function stohex(s) {
    return BAtohex(stoBA(s));
}

// ==== string / base64 ================================
/**
 * convert a ASCII string to a Base64 encoded string.<br/>
 * NOTE: This can't be used for non ASCII characters.
 * @name stob64
 * @function
 * @param {s} s ASCII string
 * @return {String} Base64 encoded string
 */
function stob64(s) {
    return hex2b64(stohex(s));
}

// ==== string / base64url ================================
/**
 * convert a ASCII string to a Base64URL encoded string.<br/>
 * NOTE: This can't be used for non ASCII characters.
 * @name stob64u
 * @function
 * @param {s} s ASCII string
 * @return {String} Base64URL encoded string
 */
function stob64u(s) {
    return b64tob64u(hex2b64(stohex(s)));
}

/**
 * convert a Base64URL encoded string to a ASCII string.<br/>
 * NOTE: This can't be used for Base64URL encoded non ASCII characters.
 * @name b64utos
 * @function
 * @param {s} s Base64URL encoded string
 * @return {String} ASCII string
 */
function b64utos(s) {
    return BAtos(b64toBA(b64utob64(s)));
}

// ==== base64 / base64url ================================
/**
 * convert a Base64 encoded string to a Base64URL encoded string.<br/>
 * @name b64tob64u
 * @function
 * @param {String} s Base64 encoded string
 * @return {String} Base64URL encoded string
 * @example
 * b64tob64u("ab+c3f/==") &rarr; "ab-c3f_"
 */
function b64tob64u(s) {
    s = s.replace(/\=/g, "");
    s = s.replace(/\+/g, "-");
    s = s.replace(/\//g, "_");
    return s;
}

/**
 * convert a Base64URL encoded string to a Base64 encoded string.<br/>
 * @name b64utob64
 * @function
 * @param {String} s Base64URL encoded string
 * @return {String} Base64 encoded string
 * @example
 * b64utob64("ab-c3f_") &rarr; "ab+c3f/=="
 */
function b64utob64(s) {
    if (s.length % 4 == 2) s = s + "==";
    else if (s.length % 4 == 3) s = s + "=";
    s = s.replace(/-/g, "+");
    s = s.replace(/_/g, "/");
    return s;
}

// ==== hex / base64url ================================
/**
 * convert a hexadecimal string to a Base64URL encoded string.<br/>
 * @name hextob64u
 * @function
 * @param {String} s hexadecimal string
 * @return {String} Base64URL encoded string
 * @description
 * convert a hexadecimal string to a Base64URL encoded string.
 * NOTE: If leading "0" is omitted and odd number length for
 * hexadecimal leading "0" is automatically added.
 */
function hextob64u(s) {
    if (s.length % 2 == 1) s = "0" + s;
    return b64tob64u(hex2b64(s));
}

/**
 * convert a Base64URL encoded string to a hexadecimal string.<br/>
 * @name b64utohex
 * @function
 * @param {String} s Base64URL encoded string
 * @return {String} hexadecimal string
 */
function b64utohex(s) {
    return b64tohex(b64utob64(s));
}

// ==== utf8 / base64url ================================

/**
 * convert a UTF-8 encoded string including CJK or Latin to a Base64URL encoded string.<br/>
 * @name utf8tob64u
 * @function
 * @param {String} s UTF-8 encoded string
 * @return {String} Base64URL encoded string
 * @since 1.1
 * @example
 * utf8tob64u("あ") &rarr; "44GC"
 * utf8tob64u("aaa") &rarr; "YWFh"
 */

/**
 * convert a Base64URL encoded string to a UTF-8 encoded string including CJK or Latin.<br/>
 * @name b64utoutf8
 * @function
 * @param {String} s Base64URL encoded string
 * @return {String} UTF-8 encoded string
 * @since 1.1
 * @example
 * b64utoutf8("44GC") &rarr; "あ"
 * b64utoutf8("YWFh") &rarr; "aaa"
 */

var utf8tob64u, b64utoutf8;

if (typeof Buffer === 'function') {
  utf8tob64u = function (s) {
    return b64tob64u(Buffer.from(s, 'utf8').toString('base64'));
  };

  b64utoutf8 = function (s) {
    return Buffer.from(b64utob64(s), 'base64').toString('utf8');
  };
} else {
  utf8tob64u = function (s) {
    return hextob64u(uricmptohex(encodeURIComponentAll(s)));
  };

  b64utoutf8 = function (s) {
    return decodeURIComponent(hextouricmp(b64utohex(s)));
  };
}

// ==== utf8 / base64url ================================
/**
 * convert a UTF-8 encoded string including CJK or Latin to a Base64 encoded string.<br/>
 * @name utf8tob64
 * @function
 * @param {String} s UTF-8 encoded string
 * @return {String} Base64 encoded string
 * @since 1.1.1
 */
function utf8tob64(s) {
  return hex2b64(uricmptohex(encodeURIComponentAll(s)));
}

/**
 * convert a Base64 encoded string to a UTF-8 encoded string including CJK or Latin.<br/>
 * @name b64toutf8
 * @function
 * @param {String} s Base64 encoded string
 * @return {String} UTF-8 encoded string
 * @since 1.1.1
 */
function b64toutf8(s) {
  return decodeURIComponent(hextouricmp(b64tohex(s)));
}

// ==== utf8 / hex ================================
/**
 * convert a UTF-8 encoded string including CJK or Latin to a hexadecimal encoded string.<br/>
 * @name utf8tohex
 * @function
 * @param {String} s UTF-8 encoded string
 * @return {String} hexadecimal encoded string
 * @since 1.1.1
 */
function utf8tohex(s) {
  return uricmptohex(encodeURIComponentAll(s)).toLowerCase();
}

/**
 * convert a hexadecimal encoded string to a UTF-8 encoded string including CJK or Latin.<br/>
 * Note that when input is improper hexadecimal string as UTF-8 string, this function returns
 * 'null'.
 * @name hextoutf8
 * @function
 * @param {String} s hexadecimal encoded string
 * @return {String} UTF-8 encoded string or null
 * @since 1.1.1
 */
function hextoutf8(s) {
  try {
    return decodeURIComponent(hextouricmp(s));
  } catch(ex) {
    return null;
  }
}

// ==== iso8859-1 latin1 / utf8 ===================
/**
 * convert a hexadecimal ISO 8859-1 latin string to UTF-8 string<br/>
 * @name iso88591hextoutf8
 * @function
 * @param {String} h hexadecimal ISO 8859-1 latin string
 * @return {String} UTF-8 string
 * @since jsrsasign 10.5.12 base64x 1.1.25
 * @see utf8toiso88591hex
 *
 * @example
 * iso88591hextoutf8("41a9fa") &rarr; "A©ú"
 */
function iso88591hextoutf8(h) {
    return hextoutf8(iso88591hextoutf8hex(h));
}

/**
 * convert UTF-8 string to a hexadecimal ISO 8859-1 latin string<br/>
 * @name utf8toiso88591hex
 * @function
 * @param {String} s hexadecimal ISO 8859-1 latin string
 * @return {String} UTF-8 string
 * @since jsrsasign 10.5.12 base64x 1.1.25
 * @see iso88591hextoutf8
 *
 * @example
 * utf8toiso88591hex("A©ú") &rarr; "41a9fa"
 */
function utf8toiso88591hex(s) {
    return utf8hextoiso88591hex(utf8tohex(s));
}

/**
 * convert a hexadecimal ISO 8859-1 latin string to UTF-8 hexadecimal string<br/>
 * @name iso88591hextoutf8hex
 * @function
 * @param {String} h hexadecimal ISO 8859-1 latin string
 * @return {String} UTF-8 hexadecimal string
 * @since jsrsasign 10.5.12 base64x 1.1.25
 * @see iso88591hextoutf8
 * @see utf8hextoiso88591hex
 *
 * @example
 * iso88591hextoutf8hex("41a9fa") &rarr; "41c2a9c3ba"
 */
function iso88591hextoutf8hex(h) {
    var a = h.match(/.{1,2}/g);
    var a2 = [];
    for (var i = 0; i < a.length; i++) {
	var di = parseInt(a[i], 16);
	if (0xa1 <= di && di <= 0xbf) {
	    a2.push("c2");
	    a2.push(a[i]);
	} else if (0xc0 <= di && di <= 0xff) {
	    a2.push("c3");
	    a2.push((di - 64).toString(16));
	} else {
	    a2.push(a[i]);
	}
    }
    return a2.join('');
}

/**
 * convert UTF-8 string to a hexadecimal ISO 8859-1 latin string<br/>
 * @name utf8hextoiso88591hex
 * @function
 * @param {String} h hexadecimal UTF-8 string
 * @return {String} hexadecimal ISO 8859-1 latin string
 * @since jsrsasign 10.5.12 base64x 1.1.25
 * @see iso88591hextoutf8hex
 * @see utf8toiso88591hex
 *
 * @example
 * utf8hextoiso88591hex("41c2a9c3ba") &rarr; "41a9fa"
 */
function utf8hextoiso88591hex(h) {
    var a = h.match(/.{1,2}/g);
    var a2 = [];
    for (var i = 0; i < a.length; i++) {
	if (a[i] == 'c2') {
	    i++;
	    a2.push(a[i]);
	} else if (a[i] == 'c3') {
	    i++;
	    var ci = a[i];
	    var di = parseInt(a[i], 16) + 64;
	    a2.push(di.toString(16));
	} else {
	    a2.push(a[i]);
	}
    }
    return a2.join('');
}

// ==== rstr / hex ================================
/**
 * convert a hexadecimal encoded string to raw string including non printable characters.<br/>
 * @name hextorstr
 * @function
 * @param {String} s hexadecimal encoded string
 * @return {String} raw string
 * @since 1.1.2
 * @example
 * hextorstr("610061") &rarr; "a\x00a"
 */
function hextorstr(sHex) {
    var s = "";
    for (var i = 0; i < sHex.length - 1; i += 2) {
        s += String.fromCharCode(parseInt(sHex.substr(i, 2), 16));
    }
    return s;
}

/**
 * convert a raw string including non printable characters to hexadecimal encoded string.<br/>
 * @name rstrtohex
 * @function
 * @param {String} s raw string
 * @return {String} hexadecimal encoded string
 * @since 1.1.2
 * @example
 * rstrtohex("a\x00a") &rarr; "610061"
 */
function rstrtohex(s) {
    var result = "";
    for (var i = 0; i < s.length; i++) {
        result += ("0" + s.charCodeAt(i).toString(16)).slice(-2);
    }
    return result;
}

// ==== hex / b64nl =======================================

/**
 * convert a hexadecimal string to Base64 encoded string<br/>
 * @name hextob64
 * @function
 * @param {String} s hexadecimal string
 * @return {String} resulted Base64 encoded string
 * @since base64x 1.1.3
 * @description
 * This function converts from a hexadecimal string to Base64 encoded
 * string without new lines.
 * @example
 * hextob64("616161") &rarr; "YWFh"
 */
function hextob64(s) {
    return hex2b64(s);
}

/**
 * convert a hexadecimal string to Base64 encoded string with new lines<br/>
 * @name hextob64nl
 * @function
 * @param {String} s hexadecimal string
 * @return {String} resulted Base64 encoded string with new lines
 * @since base64x 1.1.3
 * @description
 * This function converts from a hexadecimal string to Base64 encoded
 * string with new lines for each 64 characters. This is useful for
 * PEM encoded file.
 * @example
 * hextob64nl("123456789012345678901234567890123456789012345678901234567890")
 * &rarr;
 * MTIzNDU2Nzg5MDEyMzQ1Njc4OTAxMjM0NTY3ODkwMTIzNDU2Nzg5MDEyMzQ1Njc4 // new line
 * OTAxMjM0NTY3ODkwCg==
 */
function hextob64nl(s) {
    var b64 = hextob64(s);
    var b64nl = b64.replace(/(.{64})/g, "$1\r\n");
    b64nl = b64nl.replace(/\r\n$/, '');
    return b64nl;
}

/**
 * convert a Base64 encoded string with new lines to a hexadecimal string<br/>
 * @name b64nltohex
 * @function
 * @param {String} s Base64 encoded string with new lines
 * @return {String} hexadecimal string
 * @since base64x 1.1.3
 * @description
 * This function converts from a Base64 encoded
 * string with new lines to a hexadecimal string.
 * This is useful to handle PEM encoded file.
 * This function removes any non-Base64 characters (i.e. not 0-9,A-Z,a-z,\,+,=)
 * including new line.
 * @example
 * hextob64nl(
 * "MTIzNDU2Nzg5MDEyMzQ1Njc4OTAxMjM0NTY3ODkwMTIzNDU2Nzg5MDEyMzQ1Njc4\r\n" +
 * "OTAxMjM0NTY3ODkwCg==\r\n")
 * &rarr;
 * "123456789012345678901234567890123456789012345678901234567890"
 */
function b64nltohex(s) {
    var b64 = s.replace(/[^0-9A-Za-z\/+=]*/g, '');
    var hex = b64tohex(b64);
    return hex;
} 

// ==== hex / pem =========================================

/**
 * get PEM string from hexadecimal data and header string
 * @name hextopem
 * @function
 * @param {String} dataHex hexadecimal string of PEM body
 * @param {String} pemHeader PEM header string (ex. 'RSA PRIVATE KEY')
 * @return {String} PEM formatted string of input data
 * @since jsrasign 7.2.1 base64x 1.1.12
 * @description
 * This function converts a hexadecimal string to a PEM string with
 * a specified header. Its line break will be CRLF("\r\n").
 * @example
 * hextopem('616161', 'RSA PRIVATE KEY') &rarr;
 * -----BEGIN PRIVATE KEY-----
 * YWFh
 * -----END PRIVATE KEY-----
 */
function hextopem(dataHex, pemHeader) {
    var pemBody = hextob64nl(dataHex);
    return "-----BEGIN " + pemHeader + "-----\r\n" + 
        pemBody + 
        "\r\n-----END " + pemHeader + "-----\r\n";
}

/**
 * get hexacedimal string from PEM format data<br/>
 * @name pemtohex
 * @function
 * @param {String} s PEM formatted string
 * @param {String} sHead PEM header string without BEGIN/END(OPTION)
 * @return {String} hexadecimal string data of PEM contents
 * @since jsrsasign 7.2.1 base64x 1.1.12
 * @description
 * This static method gets a hexacedimal string of contents 
 * from PEM format data. You can explicitly specify PEM header 
 * by sHead argument. 
 * Any space characters such as white space or new line
 * will be omitted.<br/>
 * NOTE: Now {@link KEYUTIL.getHexFromPEM} and {@link X509.pemToHex}
 * have been deprecated since jsrsasign 7.2.1. 
 * Please use this method instead.
 * NOTE2: From jsrsasign 8.0.14 this can process multi
 * "BEGIN...END" section such as "EC PRIVATE KEY" with "EC PARAMETERS".
 * @example
 * pemtohex("-----BEGIN PUBLIC KEY...") &rarr; "3082..."
 * pemtohex("-----BEGIN CERTIFICATE...", "CERTIFICATE") &rarr; "3082..."
 * pemtohex(" \r\n-----BEGIN DSA PRIVATE KEY...") &rarr; "3082..."
 * pemtohex("-----BEGIN EC PARAMETERS...----BEGIN EC PRIVATE KEY...." &rarr; "3082..."
 */
function pemtohex(s, sHead) {
    if (s.indexOf("-----BEGIN ") == -1)
        throw "can't find PEM header: " + sHead;

    if (sHead !== undefined) {
        s = s.replace(new RegExp('^[^]*-----BEGIN ' + sHead + '-----'), '');
        s = s.replace(new RegExp('-----END ' + sHead + '-----[^]*$'), '');
    } else {
        s = s.replace(/^[^]*-----BEGIN [^-]+-----/, '');
        s = s.replace(/-----END [^-]+-----[^]*$/, '');
    }
    return b64nltohex(s);
}

// ==== hex / ArrayBuffer =================================

/**
 * convert a hexadecimal string to an ArrayBuffer<br/>
 * @name hextoArrayBuffer
 * @function
 * @param {String} hex hexadecimal string
 * @return {ArrayBuffer} ArrayBuffer
 * @since jsrsasign 6.1.4 base64x 1.1.8
 * @description
 * This function converts from a hexadecimal string to an ArrayBuffer.
 * @example
 * hextoArrayBuffer("fffa01") &rarr; ArrayBuffer of [255, 250, 1]
 */
function hextoArrayBuffer(hex) {
    if (hex.length % 2 != 0) throw "input is not even length";
    if (hex.match(/^[0-9A-Fa-f]+$/) == null) throw "input is not hexadecimal";

    var buffer = new ArrayBuffer(hex.length / 2);
    var view = new DataView(buffer);

    for (var i = 0; i < hex.length / 2; i++) {
	view.setUint8(i, parseInt(hex.substr(i * 2, 2), 16));
    }

    return buffer;
}

// ==== ArrayBuffer / hex =================================

/**
 * convert an ArrayBuffer to a hexadecimal string<br/>
 * @name ArrayBuffertohex
 * @function
 * @param {ArrayBuffer} buffer ArrayBuffer
 * @return {String} hexadecimal string
 * @since jsrsasign 6.1.4 base64x 1.1.8
 * @description
 * This function converts from an ArrayBuffer to a hexadecimal string.
 * @example
 * var buffer = new ArrayBuffer(3);
 * var view = new DataView(buffer);
 * view.setUint8(0, 0xfa);
 * view.setUint8(1, 0xfb);
 * view.setUint8(2, 0x01);
 * ArrayBuffertohex(buffer) &rarr; "fafb01"
 */
function ArrayBuffertohex(buffer) {
    var hex = "";
    var view = new DataView(buffer);

    for (var i = 0; i < buffer.byteLength; i++) {
	hex += ("00" + view.getUint8(i).toString(16)).slice(-2);
    }

    return hex;
}

// ==== zulu / int =================================
/**
 * GeneralizedTime or UTCTime string to milliseconds from Unix origin<br>
 * @name zulutomsec
 * @function
 * @param {String} s GeneralizedTime or UTCTime string (ex. 20170412235959.384Z)
 * @return {Number} milliseconds from Unix origin time (i.e. Jan 1, 1970 0:00:00 UTC)
 * @since jsrsasign 7.1.3 base64x 1.1.9
 * @description
 * This function converts from GeneralizedTime string (i.e. YYYYMMDDHHmmSSZ) or
 * UTCTime string (i.e. YYMMDDHHmmSSZ) to milliseconds from Unix origin time
 * (i.e. Jan 1 1970 0:00:00 UTC). 
 * Argument string may have fraction of seconds and
 * its length is one or more digits such as "20170410235959.1234567Z".
 * As for UTCTime, if year "YY" is equal or less than 49 then it is 20YY.
 * If year "YY" is equal or greater than 50 then it is 19YY.
 * @example
 * zulutomsec(  "071231235959Z")       &rarr; 1199145599000 #Mon, 31 Dec 2007 23:59:59 GMT
 * zulutomsec(  "071231235959.1Z")     &rarr; 1199145599100 #Mon, 31 Dec 2007 23:59:59 GMT
 * zulutomsec(  "071231235959.12345Z") &rarr; 1199145599123 #Mon, 31 Dec 2007 23:59:59 GMT
 * zulutomsec("20071231235959Z")       &rarr; 1199145599000 #Mon, 31 Dec 2007 23:59:59 GMT
 * zulutomsec(  "931231235959Z")       &rarr; -410227201000 #Mon, 31 Dec 1956 23:59:59 GMT
 */
function zulutomsec(s) {
    var year, month, day, hour, min, sec, msec, d;
    var sYear, sFrac, sMsec, matchResult;

    matchResult = s.match(/^(\d{2}|\d{4})(\d\d)(\d\d)(\d\d)(\d\d)(\d\d)(|\.\d+)Z$/);

    if (matchResult) {
        sYear = matchResult[1];
	year = parseInt(sYear);
        if (sYear.length === 2) {
	    if (50 <= year && year < 100) {
		year = 1900 + year;
	    } else if (0 <= year && year < 50) {
		year = 2000 + year;
	    }
	}
	month = parseInt(matchResult[2]) - 1;
	day = parseInt(matchResult[3]);
	hour = parseInt(matchResult[4]);
	min = parseInt(matchResult[5]);
	sec = parseInt(matchResult[6]);
	msec = 0;

	sFrac = matchResult[7];
	if (sFrac !== "") {
	    sMsec = (sFrac.substr(1) + "00").substr(0, 3); // .12 -> 012
	    msec = parseInt(sMsec);
	}
	return Date.UTC(year, month, day, hour, min, sec, msec);
    }
    throw new Error("unsupported zulu format: " + s);
}

/**
 * GeneralizedTime or UTCTime string to seconds from Unix origin<br>
 * @name zulutosec
 * @function
 * @param {String} s GeneralizedTime or UTCTime string (ex. 20170412235959.384Z)
 * @return {Number} seconds from Unix origin time (i.e. Jan 1, 1970 0:00:00 UTC)
 * @since jsrsasign 7.1.3 base64x 1.1.9
 * @description
 * This function converts from GeneralizedTime string (i.e. YYYYMMDDHHmmSSZ) or
 * UTCTime string (i.e. YYMMDDHHmmSSZ) to seconds from Unix origin time
 * (i.e. Jan 1 1970 0:00:00 UTC). Argument string may have fraction of seconds 
 * however result value will be omitted.
 * As for UTCTime, if year "YY" is equal or less than 49 then it is 20YY.
 * If year "YY" is equal or greater than 50 then it is 19YY.
 * @example
 * zulutosec(  "071231235959Z")       &rarr; 1199145599 #Mon, 31 Dec 2007 23:59:59 GMT
 * zulutosec(  "071231235959.1Z")     &rarr; 1199145599 #Mon, 31 Dec 2007 23:59:59 GMT
 * zulutosec("20071231235959Z")       &rarr; 1199145599 #Mon, 31 Dec 2007 23:59:59 GMT
 */
function zulutosec(s) {
    return Math.round(zulutomsec(s) / 1000.0);
}

// ==== zulu / Date =================================

/**
 * GeneralizedTime or UTCTime string to Date object<br>
 * @name zulutodate
 * @function
 * @param {String} s GeneralizedTime or UTCTime string (ex. 20170412235959.384Z)
 * @return {Date} Date object for specified time
 * @since jsrsasign 7.1.3 base64x 1.1.9
 * @description
 * This function converts from GeneralizedTime string (i.e. YYYYMMDDHHmmSSZ) or
 * UTCTime string (i.e. YYMMDDHHmmSSZ) to Date object.
 * Argument string may have fraction of seconds and
 * its length is one or more digits such as "20170410235959.1234567Z".
 * As for UTCTime, if year "YY" is equal or less than 49 then it is 20YY.
 * If year "YY" is equal or greater than 50 then it is 19YY.
 * @example
 * zulutodate(  "071231235959Z").toUTCString()   &rarr; "Mon, 31 Dec 2007 23:59:59 GMT"
 * zulutodate(  "071231235959.1Z").toUTCString() &rarr; "Mon, 31 Dec 2007 23:59:59 GMT"
 * zulutodate("20071231235959Z").toUTCString()   &rarr; "Mon, 31 Dec 2007 23:59:59 GMT"
 * zulutodate(  "071231235959.34").getMilliseconds() &rarr; 340
 */
function zulutodate(s) {
    return new Date(zulutomsec(s));
}

// ==== Date / zulu =================================

/**
 * Date object to zulu time string<br>
 * @name datetozulu
 * @function
 * @param {Date} d Date object for specified time
 * @param {Boolean} flagUTCTime if this is true year will be YY otherwise YYYY
 * @param {Boolean} flagMilli if this is true result concludes milliseconds
 * @return {String} GeneralizedTime or UTCTime string (ex. 20170412235959.384Z)
 * @since jsrsasign 7.2.0 base64x 1.1.11
 * @description
 * This function converts from Date object to GeneralizedTime string (i.e. YYYYMMDDHHmmSSZ) or
 * UTCTime string (i.e. YYMMDDHHmmSSZ).
 * As for UTCTime, if year "YY" is equal or less than 49 then it is 20YY.
 * If year "YY" is equal or greater than 50 then it is 19YY.
 * If flagMilli is true its result concludes milliseconds such like
 * "20170520235959.42Z". 
 * @example
 * d = new Date(Date.UTC(2017,4,20,23,59,59,670));
 * datetozulu(d) &rarr; "20170520235959Z"
 * datetozulu(d, true) &rarr; "170520235959Z"
 * datetozulu(d, false, true) &rarr; "20170520235959.67Z"
 */
function datetozulu(d, flagUTCTime, flagMilli) {
    var s;
    var year = d.getUTCFullYear();
    if (flagUTCTime) {
	if (year < 1950 || 2049 < year) 
	    throw "not proper year for UTCTime: " + year;
	s = ("" + year).slice(-2);
    } else {
	s = ("000" + year).slice(-4);
    }
    s += ("0" + (d.getUTCMonth() + 1)).slice(-2);
    s += ("0" + d.getUTCDate()).slice(-2);
    s += ("0" + d.getUTCHours()).slice(-2);
    s += ("0" + d.getUTCMinutes()).slice(-2);
    s += ("0" + d.getUTCSeconds()).slice(-2);
    if (flagMilli) {
	var milli = d.getUTCMilliseconds();
	if (milli !== 0) {
	    milli = ("00" + milli).slice(-3);
	    milli = milli.replace(/0+$/g, "");
	    s += "." + milli;
	}
    }
    s += "Z";
    return s;
}

// ==== URIComponent / hex ================================
/**
 * convert a URLComponent string such like "%67%68" to a hexadecimal string.<br/>
 * @name uricmptohex
 * @function
 * @param {String} s URIComponent string such like "%67%68"
 * @return {String} hexadecimal string
 * @since 1.1
 */
function uricmptohex(s) {
  return s.replace(/%/g, "");
}

/**
 * convert a hexadecimal string to a URLComponent string such like "%67%68".<br/>
 * @name hextouricmp
 * @function
 * @param {String} s hexadecimal string
 * @return {String} URIComponent string such like "%67%68"
 * @since 1.1
 */
function hextouricmp(s) {
  return s.replace(/(..)/g, "%$1");
}

// ==== hex / ipv6 =================================

/**
 * convert any IPv6 address to a 16 byte hexadecimal string
 * @function
 * @param s string of IPv6 address
 * @return {String} 16 byte hexadecimal string of IPv6 address
 * @description
 * This function converts any IPv6 address representation string
 * to a 16 byte hexadecimal string of address.
 * @example
 * 
 */
function ipv6tohex(s) {
  var msgMalformedAddress = "malformed IPv6 address";
  if (! s.match(/^[0-9A-Fa-f:]+$/))
    throw msgMalformedAddress;

  // 1. downcase
  s = s.toLowerCase();

  // 2. expand ::
  var num_colon = s.split(':').length - 1;
  if (num_colon < 2) throw msgMalformedAddress;
  var colon_replacer = ':'.repeat(7 - num_colon + 2);
  s = s.replace('::', colon_replacer);

  // 3. fill zero
  var a = s.split(':');
  if (a.length != 8) throw msgMalformedAddress;
  for (var i = 0; i < 8; i++) {
    a[i] = ("0000" + a[i]).slice(-4);
  }
  return a.join('');
}

/**
 * convert a 16 byte hexadecimal string to RFC 5952 canonicalized IPv6 address<br/>
 * @name hextoipv6
 * @function
 * @param {String} s hexadecimal string of 16 byte IPv6 address
 * @return {String} IPv6 address string canonicalized by RFC 5952
 * @since jsrsasign 8.0.10 base64x 1.1.13
 * @description
 * This function converts a 16 byte hexadecimal string to 
 * <a href="https://tools.ietf.org/html/rfc5952">RFC 5952</a>
 * canonicalized IPv6 address string.
 * @example
 * hextoipv6("871020010db8000000000000000000000004") &rarr "2001:db8::4"
 * hextoipv6("871020010db8000000000000000000") &rarr raise exception
 * hextoipv6("xyzxyzxyzxyzxyzxyzxyzxyzxyzxyzxyzxyz") &rarr raise exception
 */
function hextoipv6(s) {
    if (! s.match(/^[0-9A-Fa-f]{32}$/))
	throw new Error("malformed IPv6 address: " + s);

    // 1. downcase
    s = s.toLowerCase();

    // 2. split 4 > ["0123", "00a4", "0000", ..., "ffff"]
    var a = s.match(/.{1,4}/g);

    // 3. trim leading 0 for items and join > "123:a4:0:...:ffff"
    a = a.map(function(s){return s.replace(/^0+/, '')});
    a = a.map(function(s){return s == '' ? '0' : s});
    s = ':' + a.join(':') + ':';

    // 4. find shrinkable candidates :0:0:..:0:
    var aZero = s.match(/:(0:){2,}/g);

    // 5. no shrinkable
    if (aZero == null) return s.slice(1, -1);

    // 6. fix max length zero(:0:...:0:)
    var sMaxZero = aZero.sort().slice(-1)[0];

    // 7. replace shrinked
    s = s.replace(sMaxZero.substr(0, sMaxZero.length - 1), ':');

    // 8. trim leading ':' if not '::'
    if (s.substr(0, 2) != '::') s = s.substr(1);

    // 9. trim tail ':' if not '::'
    if (s.substr(-2, 2) != '::') s = s.substr(0, s.length - 1);

    return s;
}

// ==== hex / ip =================================

/**
 * convert a hexadecimal string to IP addresss<br/>
 * @name hextoip
 * @function
 * @param {String} s hexadecimal string of IP address
 * @return {String} IP address string
 * @since jsrsasign 8.0.10 base64x 1.1.13
 * @see hextoipv6
 * @see iptohex
 *
 * @description
 * This function converts a hexadecimal string of IPv4 or 
 * IPv6 address to IPv4 or IPv6 address string.
 * If byte length is not 4 nor 16, this returns a
 * hexadecimal string without conversion.
 * <br/>
 * NOTE: From jsrsasign 10.5.17, CIDR subnet mask notation also supported.
 *
 * @example
 * hextoip("c0a80101") &rarr; "192.168.1.1"
 * hextoip("871020010db8000000000000000000000004") &rarr "2001:db8::4"
 * hextoip("c0a80100ffffff00") &rarr; "192.168.1.0/24"
 * hextoip("c0a801010203") &rarr; "c0a801010203" // wrong 6 bytes
 * hextoip("zzz")) &rarr; raise exception because of not hexadecimal
 */
function hextoip(s) {
    var malformedErr = new Error("malformed hex value");
    if (! s.match(/^([0-9A-Fa-f][0-9A-Fa-f]){1,}$/))
	throw malformedErr;
    if (s.length == 8) { // ipv4
	var ip;
	try {
	    ip = parseInt(s.substr(0, 2), 16) + "." +
 		 parseInt(s.substr(2, 2), 16) + "." +
		 parseInt(s.substr(4, 2), 16) + "." +
		 parseInt(s.substr(6, 2), 16);
	    return ip;
	} catch (ex) {
	    throw malformedErr;
	}
  } else if (s.length == 16) {
      try {
	  return hextoip(s.substr(0, 8)) + "/" + ipprefixlen(s.substr(8));
      } catch (ex) {
	  throw malformedErr;
      }
  } else if (s.length == 32) {
      return hextoipv6(s);
  } else if (s.length == 64) {
      try {
	  return hextoipv6(s.substr(0, 32)) + "/" + ipprefixlen(s.substr(32));
      } catch (ex) {
	  throw malformedErr;
      }
      return 
  } else {
    return s;
  }
}

/*
 * convert subnet mask hex to ip address prefix length<br/>
 * @name ipprefixlen
 * @param {string} hMask hexadecimal string of ipv4/6 subnet mask (ex. "ffffff00" for v4 class C)
 * @return {nummber} ip address prefix length (ex. 24 for IPv4 class C)
 */
function ipprefixlen(hMask) {
    var malformedErr = new Error("malformed mask");
    var bMask;
    try {
	bMask = new BigInteger(hMask, 16).toString(2);
    } catch(ex) {
	throw malformedErr;
    }
    if (! bMask.match(/^1*0*$/)) throw malformedErr;
    return bMask.replace(/0+$/, '').length;
}

/**
 * convert IPv4/v6 addresss to a hexadecimal string<br/>
 * @name iptohex
 * @function
 * @param {String} s IPv4/v6 address string
 * @return {String} hexadecimal string of IP address
 * @since jsrsasign 8.0.12 base64x 1.1.14
 * @see hextoip
 * @see ipv6tohex
 *
 * @description
 * This function converts IPv4 or IPv6 address string to
 * a hexadecimal string of IPv4 or IPv6 address.
 * <br/>
 * NOTE: From jsrsasign 10.5.17, CIDR net mask notation also supported.
 *
 * @example
 * iptohex("192.168.1.1") &rarr; "c0a80101"
 * iptohex("2001:db8::4") &rarr; "871020010db8000000000000000000000004"
 * iptohex("192.168.1.1/24") &rarr; "c0a80101ffffff00"
 * iptohex("2001:db8::/120") &rarr; "871020010db8000000000000000000000000ffffffffffffffffffffffffffffffffff00"
 * iptohex("zzz")) &rarr; raise exception
 */
function iptohex(s) {
    var malformedErr = new Error("malformed IP address");
    s = s.toLowerCase(s);

    if (! s.match(/^[0-9a-f.:/]+$/) ) throw malformedErr;

    if (s.match(/^[0-9.]+$/)) {
	var a = s.split(".");
	if (a.length !== 4) throw malformedErr;
	var hex = "";
	try {
	    for (var i = 0; i < 4; i++) {
		var d = parseInt(a[i]);
		hex += ("0" + d.toString(16)).slice(-2);
	    }
	    return hex;
	} catch(ex) {
	    throw malformedErr;
	}
    } else if (s.match(/^[0-9.]+\/[0-9]+$/)) {
	var aItem = s.split("/");
	return iptohex(aItem[0]) + ipnetmask(parseInt(aItem[1]), 32);
    } else if (s.match(/^[0-9a-f:]+$/) && s.indexOf(":") !== -1) {
	return ipv6tohex(s);
    } else if (s.match(/^[0-9a-f:]+\/[0-9]+$/) && s.indexOf(":") !== -1) {
	var aItem = s.split("/");
	return ipv6tohex(aItem[0]) + ipnetmask(parseInt(aItem[1]), 128);
    } else {
	throw malformedErr;
    }
}

/*
 * convert ip prefix length to net mask octets<br/>
 * @param {number} prefixlen ip prefix length value (ex. 24 for IPv4 class C)
 * @param {number} len ip address length (ex. 32 for IPv4 and 128 for IPv6)
 * @return {string} hexadecimal string of net mask octets
 * @example
 * ipnetmask(24, 32) &rarr; "ffffff00" 
 * ipnetmask(120, 128) &rarr; "ffffffffffffffffffffffffffffff00"
 */
function ipnetmask(prefixlen, len) {
    if (len == 32 && prefixlen == 0) return "00000000"; // v4
    if (len == 128 && prefixlen == 0) return "00000000000000000000000000000000"; // v6
    var b = Array(prefixlen + 1).join("1") + Array(len - prefixlen + 1).join("0");
    return new BigInteger(b, 2).toString(16);
}

// ==== ucs2hex / utf8 ==============================

/**
 * convert UCS-2 hexadecimal stirng to UTF-8 string<br/>
 * @name ucs2hextoutf8
 * @function
 * @param {String} s hexadecimal string of UCS-2 string (ex. "0066")
 * @return {String} UTF-8 string
 * @since jsrsasign 10.1.13 base64x 1.1.20
 * @description
 * This function converts hexadecimal value of UCS-2 string to 
 * UTF-8 string.
 * @example
 * ucs2hextoutf8("006600fc0072") &rarr "für"
 */
/*
See: http://nomenclator.la.coocan.jp/unicode/ucs_utf.htm
UCS-2 to UTF-8
UCS-2 code point | UCS-2 bytes       | UTF-8 bytes
U+0000 .. U+007F | 00000000-0xxxxxxx | 0xxxxxxx (1 byte)
U+0080 .. U+07FF | 00000xxx-xxyyyyyy | 110xxxxx 10yyyyyy (2 byte)
U+0800 .. U+FFFF | xxxxyyyy-yyzzzzzz | 1110xxxx 10yyyyyy 10zzzzzz (3 byte)
 */
function ucs2hextoutf8(s) {
    function _conv(s) {
	var i1 = parseInt(s.substr(0, 2), 16);
	var i2 = parseInt(s.substr(2), 16);
	if (i1 == 0 & i2 < 0x80) { // 1 byte
	    return String.fromCharCode(i2);
	}
	if (i1 < 8) { // 2 bytes
	    var u1 = 0xc0 | ((i1 & 0x07) << 3) | ((i2 & 0xc0) >> 6);
	    var u2 = 0x80 | (i2 & 0x3f);
	    return hextoutf8(u1.toString(16) + u2.toString(16));
	}
	// 3 bytes
	var u1 = 0xe0 | ((i1 & 0xf0) >> 4);
	var u2 = 0x80 | ((i1 & 0x0f) << 2) | ((i2 & 0xc0) >> 6);
	var u3 = 0x80 | (i2 & 0x3f);
	return hextoutf8(u1.toString(16) + u2.toString(16) + u3.toString(16));
    }
    var a = s.match(/.{4}/g);
    var a2 = a.map(_conv);
    return a2.join("");
}

// ==== URIComponent ================================
/**
 * convert UTFa hexadecimal string to a URLComponent string such like "%67%68".<br/>
 * Note that these "<code>0-9A-Za-z!'()*-._~</code>" characters will not
 * converted to "%xx" format by builtin 'encodeURIComponent()' function.
 * However this 'encodeURIComponentAll()' function will convert 
 * all of characters into "%xx" format.
 * @name encodeURIComponentAll
 * @function
 * @param {String} s hexadecimal string
 * @return {String} URIComponent string such like "%67%68"
 * @since 1.1
 */
function encodeURIComponentAll(u8) {
  var s = encodeURIComponent(u8);
  var s2 = "";
  for (var i = 0; i < s.length; i++) {
    if (s[i] == "%") {
      s2 = s2 + s.substr(i, 3);
      i = i + 2;
    } else {
      s2 = s2 + "%" + stohex(s[i]);
    }
  }
  return s2;
}

// ==== new lines ================================
/**
 * convert all DOS new line("\r\n") to UNIX new line("\n") in 
 * a String "s".
 * @name newline_toUnix
 * @function
 * @param {String} s string 
 * @return {String} converted string
 */
function newline_toUnix(s) {
    s = s.replace(/\r\n/mg, "\n");
    return s;
}

/**
 * convert all UNIX new line("\r\n") to DOS new line("\n") in 
 * a String "s".
 * @name newline_toDos
 * @function
 * @param {String} s string 
 * @return {String} converted string
 */
function newline_toDos(s) {
    s = s.replace(/\r\n/mg, "\n");
    s = s.replace(/\n/mg, "\r\n");
    return s;
}

// ==== string type checker ===================

/**
 * check whether a string is an integer string or not<br/>
 * @name isInteger
 * @memberOf KJUR.lang.String
 * @function
 * @static
 * @param {String} s input string
 * @return {Boolean} true if a string "s" is an integer string otherwise false
 * @since base64x 1.1.7 jsrsasign 5.0.13
 * @example
 * KJUR.lang.String.isInteger("12345") &rarr; true
 * KJUR.lang.String.isInteger("123ab") &rarr; false
 */
KJUR.lang.String.isInteger = function(s) {
    if (s.match(/^[0-9]+$/)) {
	return true;
    } else if (s.match(/^-[0-9]+$/)) {
	return true;
    } else {
	return false;
    }
};

/**
 * check whether a string is an hexadecimal string or not (DEPRECATED)<br/>
 * @name isHex
 * @memberOf KJUR.lang.String
 * @function
 * @static
 * @param {String} s input string
 * @return {Boolean} true if a string "s" is an hexadecimal string otherwise false
 * @since base64x 1.1.7 jsrsasign 5.0.13
 * @deprecated from 10.0.6. please use {@link ishex}
 * @see ishex
 * @example
 * KJUR.lang.String.isHex("1234") &rarr; true
 * KJUR.lang.String.isHex("12ab") &rarr; true
 * KJUR.lang.String.isHex("12AB") &rarr; true
 * KJUR.lang.String.isHex("12ZY") &rarr; false
 * KJUR.lang.String.isHex("121") &rarr; false -- odd length
 */
KJUR.lang.String.isHex = function(s) {
    return ishex(s);
};

/**
 * check whether a string is an hexadecimal string or not<br/>
 * @name ishex
 * @function
 * @static
 * @param {String} s input string
 * @return {Boolean} true if a string "s" is an hexadecimal string otherwise false
 * @since base64x 1.1.7 jsrsasign 5.0.13
 * @example
 * ishex("1234") &rarr; true
 * ishex("12ab") &rarr; true
 * ishex("12AB") &rarr; true
 * ishex("12ZY") &rarr; false
 * ishex("121") &rarr; false -- odd length
 */
function ishex(s) {
    if (s.length % 2 == 0 &&
	(s.match(/^[0-9a-f]+$/) || s.match(/^[0-9A-F]+$/))) {
	return true;
    } else {
	return false;
    }
};

/**
 * check whether a string is a base64 encoded string or not<br/>
 * Input string can conclude new lines or space characters.
 * @name isBase64
 * @memberOf KJUR.lang.String
 * @function
 * @static
 * @param {String} s input string
 * @return {Boolean} true if a string "s" is a base64 encoded string otherwise false
 * @since base64x 1.1.7 jsrsasign 5.0.13
 * @example
 * KJUR.lang.String.isBase64("YWE=") &rarr; true
 * KJUR.lang.String.isBase64("YW_=") &rarr; false
 * KJUR.lang.String.isBase64("YWE") &rarr; false -- length shall be multiples of 4
 */
KJUR.lang.String.isBase64 = function(s) {
    s = s.replace(/\s+/g, "");
    if (s.match(/^[0-9A-Za-z+\/]+={0,3}$/) && s.length % 4 == 0) {
	return true;
    } else {
	return false;
    }
};

/**
 * check whether a string is a base64url encoded string or not<br/>
 * Input string can conclude new lines or space characters.
 * @name isBase64URL
 * @memberOf KJUR.lang.String
 * @function
 * @static
 * @param {String} s input string
 * @return {Boolean} true if a string "s" is a base64url encoded string otherwise false
 * @since base64x 1.1.7 jsrsasign 5.0.13
 * @example
 * KJUR.lang.String.isBase64URL("YWE") &rarr; true
 * KJUR.lang.String.isBase64URL("YW-") &rarr; true
 * KJUR.lang.String.isBase64URL("YW+") &rarr; false
 */
KJUR.lang.String.isBase64URL = function(s) {
    if (s.match(/[+/=]/)) return false;
    s = b64utob64(s);
    return KJUR.lang.String.isBase64(s);
};


/**
 * check whether a string is a base64url encoded string and dot or not<br/>
 * Input string can conclude new lines or space characters.
 * @name isBase64URLDot
 * @function
 * @static
 * @param {String} s input string
 * @return {Boolean} true if a string "s" is a base64url encoded string and dot otherwise false
 * @since base64x 1.1.30 jsrsasign 10.5.25
 * @example
 * isBase64URLDot("YWE") &rarr; true
 * isBase64URLDot("YWE.YWE.YWE") &rarr; true
 * isBase64URLDot("YW-") &rarr; true
 * isBase64URLDot("YW+") &rarr; false
 */
function isBase64URLDot(s) {
    if (s.match(/^[0-9A-Za-z-_.]+$/)) return true;
    return false;
}

/**
 * check whether a string is a string of integer array or not<br/>
 * Input string can conclude new lines or space characters.
 * @name isIntegerArray
 * @memberOf KJUR.lang.String
 * @function
 * @static
 * @param {String} s input string
 * @return {Boolean} true if a string "s" is a string of integer array otherwise false
 * @since base64x 1.1.7 jsrsasign 5.0.13
 * @example
 * KJUR.lang.String.isIntegerArray("[1,2,3]") &rarr; true
 * KJUR.lang.String.isIntegerArray("  [1, 2, 3  ] ") &rarr; true
 * KJUR.lang.String.isIntegerArray("[a,2]") &rarr; false
 */
KJUR.lang.String.isIntegerArray = function(s) {
    s = s.replace(/\s+/g, "");
    if (s.match(/^\[[0-9,]+\]$/)) {
	return true;
    } else {
	return false;
    }
};

/**
 * check whether a string consists of PrintableString characters<br/>
 * @name isPrintable
 * @memberOf KJUR.lang.String
 * @function
 * @static
 * @param {String} s input string
 * @return {Boolean} true if a string "s" consists of PrintableString characters
 * @since jsrsasign 9.0.0 base64x 1.1.16
 * A PrintableString consists of following characters
 * <pre>
 * 0-9A-Za-z '()+,-./:=?
 * </pre>
 * This method returns false when other characters than above.
 * Otherwise it returns true.
 * @example
 * KJUR.lang.String.isPrintable("abc") &rarr; true
 * KJUR.lang.String.isPrintable("abc@") &rarr; false
 * KJUR.lang.String.isPrintable("あいう") &rarr; false
 */
KJUR.lang.String.isPrintable = function(s) {
    if (s.match(/^[0-9A-Za-z '()+,-./:=?]*$/) !== null) return true;
    return false;
};

/**
 * check whether a string consists of IAString characters<br/>
 * @name isIA5
 * @memberOf KJUR.lang.String
 * @function
 * @static
 * @param {String} s input string
 * @return {Boolean} true if a string "s" consists of IA5String characters
 * @since jsrsasign 9.0.0 base64x 1.1.16
 * A IA5String consists of following characters
 * <pre>
 * %x00-21/%x23-7F (i.e. ASCII characters excludes double quote(%x22)
 * </pre>
 * This method returns false when other characters than above.
 * Otherwise it returns true.
 * @example
 * KJUR.lang.String.isIA5("abc") &rarr; true
 * KJUR.lang.String.isIA5('"abc"') &rarr; false
 * KJUR.lang.String.isIA5("あいう") &rarr; false
 */
KJUR.lang.String.isIA5 = function(s) {
    if (s.match(/^[\x20-\x21\x23-\x7f]*$/) !== null) return true;
    return false;
};

/**
 * check whether a string is RFC 822 mail address<br/>
 * @name isMail
 * @memberOf KJUR.lang.String
 * @function
 * @static
 * @param {String} s input string
 * @return {Boolean} true if a string "s" RFC 822 mail address
 * @since jsrsasign 9.0.0 base64x 1.1.16
 * This static method will check string s is RFC 822 compliant mail address.
 * @example
 * KJUR.lang.String.isMail("abc") &rarr; false
 * KJUR.lang.String.isMail("abc@example") &rarr; false
 * KJUR.lang.String.isMail("abc@example.com") &rarr; true
 */
KJUR.lang.String.isMail = function(s) {
    if (s.match(/^[A-Za-z0-9]{1}[A-Za-z0-9_.-]*@{1}[A-Za-z0-9_.-]{1,}\.[A-Za-z0-9]{1,}$/) !== null) return true;
    return false;
};

// ==== others ================================

/**
 * canonicalize hexadecimal string of positive integer<br/>
 * @name hextoposhex
 * @function
 * @param {String} s hexadecimal string 
 * @return {String} canonicalized hexadecimal string of positive integer
 * @since base64x 1.1.10 jsrsasign 7.1.4
 * @description
 * This method canonicalize a hexadecimal string of positive integer
 * for two's complement representation.
 * Canonicalized hexadecimal string of positive integer will be:
 * <ul>
 * <li>Its length is always even.</li>
 * <li>If odd length it will be padded with leading zero.<li>
 * <li>If it is even length and its first character is "8" or greater,
 * it will be padded with "00" to make it positive integer.</li>
 * </ul>
 * @example
 * hextoposhex("abcd") &rarr; "00abcd"
 * hextoposhex("1234") &rarr; "1234"
 * hextoposhex("12345") &rarr; "012345"
 */
function hextoposhex(s) {
    if (s.length % 2 == 1) return "0" + s;
    if (s.substr(0, 1) > "7") return "00" + s;
    return s;
}

/**
 * convert string of integer array to hexadecimal string.<br/>
 * @name intarystrtohex
 * @function
 * @param {String} s string of integer array
 * @return {String} hexadecimal string
 * @since base64x 1.1.6 jsrsasign 5.0.2
 * @throws "malformed integer array string: *" for wrong input
 * @description
 * This function converts a string of JavaScript integer array to
 * a hexadecimal string. Each integer value shall be in a range 
 * from 0 to 255 otherwise it raise exception. Input string can
 * have extra space or newline string so that they will be ignored.
 * 
 * @example
 * intarystrtohex(" [123, 34, 101, 34, 58] ")
 * &rarr; 7b2265223a (i.e. '{"e":' as string)
 */
function intarystrtohex(s) {
  s = s.replace(/^\s*\[\s*/, '');
  s = s.replace(/\s*\]\s*$/, '');
  s = s.replace(/\s*/g, '');
  try {
    var hex = s.split(/,/).map(function(element, index, array) {
      var i = parseInt(element);
      if (i < 0 || 255 < i) throw "integer not in range 0-255";
      var hI = ("00" + i.toString(16)).slice(-2);
      return hI;
    }).join('');
    return hex;
  } catch(ex) {
    throw "malformed integer array string: " + ex;
  }
}

/**
 * find index of string where two string differs
 * @name strdiffidx
 * @function
 * @param {String} s1 string to compare
 * @param {String} s2 string to compare
 * @return {Number} string index of where character differs. Return -1 if same.
 * @since jsrsasign 4.9.0 base64x 1.1.5
 * @example
 * strdiffidx("abcdefg", "abcd4fg") -> 4
 * strdiffidx("abcdefg", "abcdefg") -> -1
 * strdiffidx("abcdefg", "abcdef") -> 6
 * strdiffidx("abcdefgh", "abcdef") -> 6
 */
var strdiffidx = function(s1, s2) {
    var n = s1.length;
    if (s1.length > s2.length) n = s2.length;
    for (var i = 0; i < n; i++) {
	if (s1.charCodeAt(i) != s2.charCodeAt(i)) return i;
    }
    if (s1.length != s2.length) return n;
    return -1; // same
};

// ==== hex / oid =================================

/**
 * get hexadecimal value of object identifier from dot noted oid value
 * @name oidtohex
 * @function
 * @param {String} oidString dot noted string of object identifier
 * @return {String} hexadecimal value of object identifier
 * @since jsrsasign 10.1.0 base64x 1.1.18
 * @see hextooid
 * @see ASN1HEX.hextooidstr
 * @see KJUR.asn1.ASN1Util.oidIntToHex
 * @description
 * This static method converts from object identifier value string.
 * to hexadecimal string representation of it.
 * {@link hextooid} is a reverse function of this.
 * @example
 * oidtohex("2.5.4.6") &rarr; "550406"
 */
function oidtohex(oidString) {
    var itox = function(i) {
        var h = i.toString(16);
        if (h.length == 1) h = '0' + h;
        return h;
    };

    var roidtox = function(roid) {
        var h = '';
        var bi = parseInt(roid, 10);
        var b = bi.toString(2);

        var padLen = 7 - b.length % 7;
        if (padLen == 7) padLen = 0;
        var bPad = '';
        for (var i = 0; i < padLen; i++) bPad += '0';
        b = bPad + b;
        for (var i = 0; i < b.length - 1; i += 7) {
            var b8 = b.substr(i, 7);
            if (i != b.length - 7) b8 = '1' + b8;
            h += itox(parseInt(b8, 2));
        }
        return h;
    };
    
    try {
	if (! oidString.match(/^[0-9.]+$/)) return null;
    
	var h = '';
	var a = oidString.split('.');
	var i0 = parseInt(a[0], 10) * 40 + parseInt(a[1], 10);
	h += itox(i0);
	a.splice(0, 2);
	for (var i = 0; i < a.length; i++) {
            h += roidtox(a[i]);
	}
	return h;
    } catch(ex) {
	return null;
    }
};

/**
 * get oid string from hexadecimal value of object identifier<br/>
 * @name hextooid
 * @function
 * @param {String} h hexadecimal value of object identifier
 * @return {String} dot noted string of object identifier (ex. "1.2.3.4")
 * @since jsrsasign 10.1.0 base64x 1.1.18
 * @see oidtohex
 * @see ASN1HEX.hextooidstr
 * @see KJUR.asn1.ASN1Util.oidIntToHex
 * @description
 * This static method converts from hexadecimal object identifier value 
 * to dot noted OID value (ex. "1.2.3.4").
 * {@link oidtohex} is a reverse function of this.
 * @example
 * hextooid("550406") &rarr; "2.5.4.6"
 */
function hextooid(h) {
    if (! ishex(h)) return null;
    try {
	var a = [];

	// a[0], a[1]
	var hex0 = h.substr(0, 2);
	var i0 = parseInt(hex0, 16);
	a[0] = new String(Math.floor(i0 / 40));
	a[1] = new String(i0 % 40);

	// a[2]..a[n]
	var hex1 = h.substr(2);
	var b = [];
	for (var i = 0; i < hex1.length / 2; i++) {
	    b.push(parseInt(hex1.substr(i * 2, 2), 16));
	}
	var c = [];
	var cbin = "";
	for (var i = 0; i < b.length; i++) {
            if (b[i] & 0x80) {
		cbin = cbin + strpad((b[i] & 0x7f).toString(2), 7);
            } else {
		cbin = cbin + strpad((b[i] & 0x7f).toString(2), 7);
		c.push(new String(parseInt(cbin, 2)));
		cbin = "";
            }
	}

	var s = a.join(".");
	if (c.length > 0) s = s + "." + c.join(".");
	return s;
    } catch(ex) {
	return null;
    }
};

/**
 * string padding<br/>
 * @name strpad
 * @function
 * @param {String} s input string
 * @param {Number} len output string length
 * @param {String} padchar padding character (default is "0")
 * @return {String} padded string
 * @since jsrsasign 10.1.0 base64x 1.1.18
 * @example
 * strpad("1234", 10, "0") &rarr; "0000001234"
 * strpad("1234", 10, " ") &rarr; "      1234"
 * strpad("1234", 10)      &rarr; "0000001234"
 */
var strpad = function(s, len, padchar) {
    if (padchar == undefined) padchar = "0";
    if (s.length >= len) return s;
    return new Array(len - s.length + 1).join(padchar) + s;
};

// ==== bitstr hex / int =================================

/**
 * convert from hexadecimal string of ASN.1 BitString value with unused bit to integer value<br/>
 * @name bitstrtoint
 * @function
 * @param {String} h hexadecimal string of ASN.1 BitString value with unused bit
 * @return {Number} positive integer value of the BitString
 * @since jsrsasign 10.1.3 base64x 1.1.19
 * @see inttobitstr
 * @see KJUR.asn1.DERBitString
 * @see ASN1HEX.getInt
 * 
 * @description
 * This function converts from hexadecimal string of ASN.1 BitString
 * value with unused bit to its integer value. <br/>
 * When an improper hexadecimal string of BitString value
 * is applied, this returns -1.
 * 
 * @example
 * // "03c8" &rarr; 0xc8 unusedbit=03 &rarr; 11001000b unusedbit=03 &rarr; 11001b &rarr; 25
 * bitstrtoint("03c8") &rarr; 25
 * // "02fff8" &rarr; 0xfff8 unusedbit=02 &rarr; 1111111111111000b unusedbit=02
 * //   11111111111110b &rarr; 16382
 * bitstrtoint("02fff8") &rarr; 16382
 * bitstrtoint("05a0") &rarr; 5 (=101b)
 * bitstrtoint("ff00") &rarr; -1 // for improper BitString value
 * bitstrtoint("05a0").toString(2) &rarr; "101"
 * bitstrtoint("07a080").toString(2) &rarr; "101000001"
 */
function bitstrtoint(h) {
    if (h.length % 2 != 0) return -1; 
    h = h.toLowerCase();
    if (h.match(/^[0-9a-f]+$/) == null) return -1;
    try {
	var hUnusedbit = h.substr(0, 2);
	if (hUnusedbit == "00")
	    return parseInt(h.substr(2), 16);
	var iUnusedbit = parseInt(hUnusedbit, 16);
	if (iUnusedbit > 7) return -1;
	var hValue = h.substr(2);
	var bValue = parseInt(hValue, 16).toString(2);
	if (bValue == "0") bValue = "00000000";
	bValue = bValue.slice(0, 0 - iUnusedbit);
	var iValue = parseInt(bValue, 2);
	if (iValue == NaN) return -1;
	return iValue;
    } catch(ex) {
	return -1;
    }
};

/**
 * convert from integer value to hexadecimal string of ASN.1 BitString value with unused bit<br/>
 * @name inttobitstr
 * @function
 * @param {Number} n integer value of ASN.1 BitString
 * @return {String} hexadecimal string of ASN.1 BitString value with unused bit
 * @since jsrsasign 10.1.3 base64x 1.1.19
 * @see bitstrtoint
 * @see KJUR.asn1.DERBitString
 * @see ASN1HEX.getInt
 * 
 * @description
 * This function converts from an integer value to 
 * hexadecimal string of ASN.1 BitString value
 * with unused bit. <br/>
 * When "n" is not non-negative number, this returns null
 * 
 * @example
 * // 25 &rarr; 11001b &rarr; 11001000b unusedbit=03 &rarr; 0xc8 unusedbit=03 &rarr; "03c8"
 * inttobitstr(25) &rarr; "03c8"
 * inttobitstr(-3) &rarr; null
 * inttobitstr("abc") &rarr; null
 * inttobitstr(parseInt("11001", 2)) &rarr; "03c8"
 * inttobitstr(parseInt("101", 2)) &rarr; "05a0"
 * inttobitstr(parseInt("101000001", 2)) &rarr; "07a080"
 */
function inttobitstr(n) {
    if (typeof n != "number") return null;
    if (n < 0) return null;
    var bValue = Number(n).toString(2);
    var iUnusedbit = 8 - bValue.length % 8;
    if (iUnusedbit == 8) iUnusedbit = 0;
    bValue = bValue + strpad("", iUnusedbit, "0");
    var hValue = parseInt(bValue, 2).toString(16);
    if (hValue.length % 2 == 1) hValue = "0" + hValue;
    var hUnusedbit = "0" + iUnusedbit;
    return hUnusedbit + hValue;
};

// ==== bitstr hex / binary string =======================

/**
 * convert from hexadecimal string of ASN.1 BitString value with unused bit to binary string<br/>
 * @name bitstrtobinstr
 * @function
 * @param {string} h hexadecimal string of ASN.1 BitString value with unused bit
 * @return {string} binary string
 * @since jsrsasign 10.5.4 base64x 1.1.21
 * @see binstrtobitstr
 * @see inttobitstr
 * 
 * @description
 * This function converts from hexadecimal string of ASN.1 BitString
 * value with unused bit to its integer value. <br/>
 * When an improper hexadecimal string of BitString value
 * is applied, this returns null.
 * 
 * @example
 * bitstrtobinstr("05a0") &rarr; "101"
 * bitstrtobinstr("0520") &rarr; "001"
 * bitstrtobinstr("07a080") &rarr; "101000001"
 * bitstrtobinstr(502) &rarr; null // non ASN.1 BitString value
 * bitstrtobinstr("ff00") &rarr; null // for improper BitString value
 */
function bitstrtobinstr(h) {
    if (typeof h != "string") return null;
    if (h.length % 2 != 0) return null;
    if (! h.match(/^[0-9a-f]+$/)) return null;
    try {
	var unusedBits = parseInt(h.substr(0, 2), 16);
	if (unusedBits < 0 || 7 < unusedBits) return null

	var value = h.substr(2);
	var bin = "";
	for (var i = 0; i < value.length; i += 2) {
	    var hi = value.substr(i, 2);
	    var bi = parseInt(hi, 16).toString(2);
	    bi = ("0000000" + bi).slice(-8);
	    bin += bi;
	}
	return  bin.substr(0, bin.length - unusedBits);
    } catch(ex) {
	return null;
    }
}

/**
 * convert from binary string to hexadecimal string of ASN.1 BitString value with unused bit<br/>
 * @name binstrtobitstr
 * @function
 * @param {string} s binary string (ex. "101")
 * @return {string} hexadecimal string of ASN.1 BitString value with unused bit
 * @since jsrsasign 10.5.4 base64x 1.1.21
 * @see bitstrtobinstr
 * @see inttobitstr
 * @see KJUR.asn1.DERBitString
 * 
 * @description
 * This function converts from an binary string (ex. "101") to 
 * hexadecimal string of ASN.1 BitString value
 * with unused bit (ex. "05a0"). <br/>
 * When "s" is not binary string, this returns null.
 * 
 * @example
 * binstrtobitstr("101") &rarr; "05a0"
 * binstrtobitstr("001") &rarr; "0520"
 * binstrtobitstr("11001") &rarr; "03c8"
 * binstrtobitstr("101000001") &rarr; "07a080"
 * binstrtobitstr(101) &rarr; null // not number
 * binstrtobitstr("xyz") &rarr; null // not binary string
 */
function binstrtobitstr(s) {
    if (typeof s != "string") return null;
    if (s.match(/^[01]+$/) == null) return null;
    try {
	var n = parseInt(s, 2);
	return inttobitstr(n);
    } catch(ex) {
	return null;
    }
}

// =======================================================
/**
 * convert array of names to bit string<br/>
 * @name namearraytobinstr
 * @function
 * @param {array} namearray array of name string
 * @param {object} namedb associative array of name and value
 * @return {string} binary string (ex. "110001")
 * @since jsrsasign 10.5.21 base64x 1.1.27
 * @see KJUR.asn1.x509.KeyUsage
 * @see KJUR.asn1.tsp.PKIFailureInfo
 * 
 * @description
 * This function converts from an array of names to
 * a binary string. DB value bit will be set.
 * Note that ordering of namearray items
 * will be ignored.
 *
 * @example
 * db = { a: 0, b: 3, c: 8, d: 9, e: 17, f: 19 };
 * namearraytobinstr(['a', 'c', 'd'], db) &rarr: '1000000011'
 * namearraytobinstr(['c', 'b'], db) &rarr: '000100001'
 */
function namearraytobinstr (namearray, namedb) {
    var d = 0;
    for (var i = 0; i < namearray.length; i++) {
	d |= 1 << namedb[namearray[i]];
    }

    var s = d.toString(2);
    var r = "";
    for (var i = s.length - 1; i >=0; i--) {
	r += s[i];
    }
    return r;
}

// =======================================================
/**
 * set class inheritance<br/>
 * @name extendClass
 * @function
 * @param {Function} subClass sub class to set inheritance
 * @param {Function} superClass super class to inherit
 * @since jsrsasign 10.3.0 base64x 1.1.21
 *
 * @description
 * This function extends a class and set an inheritance
 * for member variables and methods.
 *
 * @example
 * var Animal = function() {
 *   this.hello = function(){console.log("Hello")};
 *   this.name="Ani";
 * };
 * var Dog = function() {
 *   Dog.superclass.constructor.call(this);
 *   this.vow = function(){console.log("Vow wow")};
 *   this.tail=true;
 * };
 * extendClass(Dog, Animal);
 */
function extendClass(subClass, superClass) {
    var F = function() {};
    F.prototype = superClass.prototype;
    subClass.prototype = new F();
    subClass.prototype.constructor = subClass;
    subClass.superclass = superClass.prototype;
     
    if (superClass.prototype.constructor == Object.prototype.constructor) {
        superClass.prototype.constructor = superClass;
    }
};


/* ecdsa-modified-1.2.2.js (c) Stephan Thomas, Kenji Urushima | github.com/bitcoinjs/bitcoinjs-lib/blob/master/LICENSE
 */
/*
 * ecdsa-modified.js - modified Bitcoin.ECDSA class
 * 
 * Copyright (c) 2013-2021 Stefan Thomas (github.com/justmoon)
 *                         Kenji Urushima (kenji.urushima@gmail.com)
 * LICENSE
 *   https://github.com/bitcoinjs/bitcoinjs-lib/blob/master/LICENSE
 */

/**
 * @fileOverview
 * @name ecdsa-modified-1.0.js
 * @author Stefan Thomas (github.com/justmoon) and Kenji Urushima (kenji.urushima@gmail.com)
 * @version jsrsasign 10.5.16 ecdsa-modified 1.2.2 (2022-Apr-08)
 * @since jsrsasign 4.0
 * @license <a href="https://github.com/bitcoinjs/bitcoinjs-lib/blob/master/LICENSE">MIT License</a>
 */

if (typeof KJUR == "undefined" || !KJUR) KJUR = {};
if (typeof KJUR.crypto == "undefined" || !KJUR.crypto) KJUR.crypto = {};

/**
 * class for EC key generation,  ECDSA signing and verifcation
 * @name KJUR.crypto.ECDSA
 * @class class for EC key generation,  ECDSA signing and verifcation
 * @description
 * <p>
 * CAUTION: Most of the case, you don't need to use this class except
 * for generating an EC key pair. Please use {@link KJUR.crypto.Signature} class instead.
 * </p>
 * <p>
 * This class was originally developped by Stefan Thomas for Bitcoin JavaScript library.
 * (See {@link https://github.com/bitcoinjs/bitcoinjs-lib/blob/master/src/ecdsa.js})
 * Currently this class supports following named curves and their aliases.
 * <ul>
 * <li>secp192k1</li>
 * <li>secp256r1, NIST P-256, P-256, prime256v1 (*)</li>
 * <li>secp256k1 (*)</li>
 * <li>secp384r1, NIST P-384, P-384 (*)</li>
 * <li>secp521r1, NIST P-521, P-521 (*)</li>
 * </ul>
 * </p>
 */
KJUR.crypto.ECDSA = function(params) {
    var curveName = "secp256r1";	// curve name default
    var ecparams = null;
    var prvKeyHex = null;
    var pubKeyHex = null;
    var _Error = Error,
	_BigInteger = BigInteger,
	_ECPointFp = ECPointFp,
	_KJUR_crypto_ECDSA = KJUR.crypto.ECDSA,
	_KJUR_crypto_ECParameterDB = KJUR.crypto.ECParameterDB,
	_getName = _KJUR_crypto_ECDSA.getName,
	_ASN1HEX = ASN1HEX,
	_getVbyListEx = _ASN1HEX.getVbyListEx,
	_isASN1HEX = _ASN1HEX.isASN1HEX;

    var rng = new SecureRandom();

    var P_OVER_FOUR = null;

    this.type = "EC";
    this.isPrivate = false;
    this.isPublic = false;

    function implShamirsTrick(P, k, Q, l) {
	var m = Math.max(k.bitLength(), l.bitLength());
	var Z = P.add2D(Q);
	var R = P.curve.getInfinity();

	for (var i = m - 1; i >= 0; --i) {
	    R = R.twice2D();

	    R.z = _BigInteger.ONE;

	    if (k.testBit(i)) {
		if (l.testBit(i)) {
		    R = R.add2D(Z);
		} else {
		    R = R.add2D(P);
		}
	    } else {
		if (l.testBit(i)) {
		    R = R.add2D(Q);
		}
	    }
	}
	
	return R;
    };

    //===========================
    // PUBLIC METHODS
    //===========================
    this.getBigRandom = function (limit) {
	return new _BigInteger(limit.bitLength(), rng)
	.mod(limit.subtract(_BigInteger.ONE))
	.add(_BigInteger.ONE)
	;
    };

    this.setNamedCurve = function(curveName) {
	this.ecparams = _KJUR_crypto_ECParameterDB.getByName(curveName);
	this.prvKeyHex = null;
	this.pubKeyHex = null;
	this.curveName = curveName;
    };

    this.setPrivateKeyHex = function(prvKeyHex) {
        this.isPrivate = true;
	this.prvKeyHex = prvKeyHex;
    };

    this.setPublicKeyHex = function(pubKeyHex) {
        this.isPublic = true;
	this.pubKeyHex = pubKeyHex;
    };

    /**
     * get X and Y hexadecimal string value of public key
     * @name getPublicKeyXYHex
     * @memberOf KJUR.crypto.ECDSA#
     * @function
     * @return {Array} associative array of x and y value of public key
     * @since ecdsa-modified 1.0.5 jsrsasign 5.0.14
     * @example
     * ec = new KJUR.crypto.ECDSA({'curve': 'secp256r1', 'pub': pubHex});
     * ec.getPublicKeyXYHex() &rarr; { x: '01bacf...', y: 'c3bc22...' }
     */
    this.getPublicKeyXYHex = function() {
	var h = this.pubKeyHex;
	if (h.substr(0, 2) !== "04")
	    throw "this method supports uncompressed format(04) only";

	var charlen = this.ecparams.keycharlen;
	if (h.length !== 2 + charlen * 2)
	    throw "malformed public key hex length";

	var result = {};
	result.x = h.substr(2, charlen);
	result.y = h.substr(2 + charlen);
	return result;
    };

    /**
     * get NIST curve short name such as "P-256" or "P-384"
     * @name getShortNISTPCurveName
     * @memberOf KJUR.crypto.ECDSA#
     * @function
     * @return {String} short NIST P curve name such as "P-256" or "P-384" if it's NIST P curve otherwise null;
     * @since ecdsa-modified 1.0.5 jsrsasign 5.0.14
     * @example
     * ec = new KJUR.crypto.ECDSA({'curve': 'secp256r1', 'pub': pubHex});
     * ec.getShortPCurveName() &rarr; "P-256";
     */
    this.getShortNISTPCurveName = function() {
	var s = this.curveName;
	if (s === "secp256r1" || s === "NIST P-256" ||
	    s === "P-256" || s === "prime256v1")
	    return "P-256";
	if (s === "secp384r1" || s === "NIST P-384" || s === "P-384")
	    return "P-384";
	if (s === "secp521r1" || s === "NIST P-521" || s === "P-521")
	    return "P-521";
	return null;
    };

    /**
     * generate a EC key pair
     * @name generateKeyPairHex
     * @memberOf KJUR.crypto.ECDSA#
     * @function
     * @return {Array} associative array of hexadecimal string of private and public key
     * @since ecdsa-modified 1.0.1
     * @example
     * var ec = new KJUR.crypto.ECDSA({'curve': 'secp256r1'});
     * var keypair = ec.generateKeyPairHex();
     * var pubhex = keypair.ecpubhex; // hexadecimal string of EC public key
     * var prvhex = keypair.ecprvhex; // hexadecimal string of EC private key (=d)
     */
    this.generateKeyPairHex = function() {
	var biN = this.ecparams['n'];
	var biPrv = this.getBigRandom(biN);
	var charlen = this.ecparams.keycharlen;
	var hPrv = ("0000000000" + biPrv.toString(16)).slice(- charlen);
	this.setPrivateKeyHex(hPrv);
	var hPub = this.generatePublicKeyHex();
	return {'ecprvhex': hPrv, 'ecpubhex': hPub};
    };

	/**
     * generate public key for EC private key
     * @name generatePublicKeyHex
     * @memberOf KJUR.crypto.ECDSA#
     * @function
     * @return {String} associative array of hexadecimal string of private and public key
     * @example
     * var ec = new KJUR.crypto.ECDSA({'curve': 'secp256r1', 'prv': prvHex});
     * var pubhex = ec.generatePublicKeyHex(); // hexadecimal string of EC public key
     * var pub ec.getPublicKeyXYHex() &rarr; { x: '01bacf...', y: 'c3bc22...' }
     */
	this.generatePublicKeyHex = function() {
		var biPrv = new _BigInteger(this.prvKeyHex, 16);
		var epPub = this.ecparams['G'].multiply(biPrv);
		var biX = epPub.getX().toBigInteger();
		var biY = epPub.getY().toBigInteger();
		var charlen = this.ecparams.keycharlen;;
		var hX   = ("0000000000" + biX.toString(16)).slice(- charlen);
		var hY   = ("0000000000" + biY.toString(16)).slice(- charlen);
		var hPub = "04" + hX + hY;
		this.setPublicKeyHex(hPub);
		return hPub;
	}

    this.signWithMessageHash = function(hashHex) {
	return this.signHex(hashHex, this.prvKeyHex);
    };

    /**
     * signing to message hash
     * @name signHex
     * @memberOf KJUR.crypto.ECDSA#
     * @function
     * @param {String} hashHex hexadecimal string of hash value of signing message
     * @param {String} privHex hexadecimal string of EC private key
     * @return {String} hexadecimal string of ECDSA signature
     * @since ecdsa-modified 1.0.1
     * @example
     * var ec = new KJUR.crypto.ECDSA({'curve': 'secp256r1'});
     * var sigValue = ec.signHex(hash, prvKey);
     */
    this.signHex = function (hashHex, privHex) {
	var d = new _BigInteger(privHex, 16);
	var n = this.ecparams['n'];

	// message hash is truncated with curve key length (FIPS 186-4 6.4)
        var e = new _BigInteger(hashHex.substring(0, this.ecparams.keycharlen), 16);

	do {
	    var k = this.getBigRandom(n);
	    var G = this.ecparams['G'];
	    var Q = G.multiply(k);
	    var r = Q.getX().toBigInteger().mod(n);
	} while (r.compareTo(_BigInteger.ZERO) <= 0);

	var s = k.modInverse(n).multiply(e.add(d.multiply(r))).mod(n);

	return _KJUR_crypto_ECDSA.biRSSigToASN1Sig(r, s);
    };

    this.sign = function (hash, priv) {
	var d = priv;
	var n = this.ecparams['n'];
	var e = _BigInteger.fromByteArrayUnsigned(hash);

	do {
	    var k = this.getBigRandom(n);
	    var G = this.ecparams['G'];
	    var Q = G.multiply(k);
	    var r = Q.getX().toBigInteger().mod(n);
	} while (r.compareTo(BigInteger.ZERO) <= 0);

	var s = k.modInverse(n).multiply(e.add(d.multiply(r))).mod(n);
	return this.serializeSig(r, s);
    };

    this.verifyWithMessageHash = function(hashHex, sigHex) {
	return this.verifyHex(hashHex, sigHex, this.pubKeyHex);
    };

    /**
     * verifying signature with message hash and public key
     * @name verifyHex
     * @memberOf KJUR.crypto.ECDSA#
     * @function
     * @param {String} hashHex hexadecimal string of hash value of signing message
     * @param {String} sigHex hexadecimal string of signature value
     * @param {String} pubkeyHex hexadecimal string of public key
     * @return {Boolean} true if the signature is valid, otherwise false
     * @since ecdsa-modified 1.0.1
     * @example
     * var ec = new KJUR.crypto.ECDSA({'curve': 'secp256r1'});
     * var result = ec.verifyHex(msgHashHex, sigHex, pubkeyHex);
     */
    this.verifyHex = function(hashHex, sigHex, pubkeyHex) {
	try {
	    var r,s;

	    var obj = _KJUR_crypto_ECDSA.parseSigHex(sigHex);
	    r = obj.r;
	    s = obj.s;
	    
	    var Q = _ECPointFp.decodeFromHex(this.ecparams['curve'], pubkeyHex);

	    // message hash is truncated with curve key length (FIPS 186-4 6.4)
            var e = new _BigInteger(hashHex.substring(0, this.ecparams.keycharlen), 16);

	    return this.verifyRaw(e, r, s, Q);
	} catch (ex) {
	    return false;
	}
    };

    this.verify = function (hash, sig, pubkey) {
	var r,s;
	if (Bitcoin.Util.isArray(sig)) {
	    var obj = this.parseSig(sig);
	    r = obj.r;
	    s = obj.s;
	} else if ("object" === typeof sig && sig.r && sig.s) {
	    r = sig.r;
	    s = sig.s;
	} else {
	    throw "Invalid value for signature";
	}

	var Q;
	if (pubkey instanceof ECPointFp) {
	    Q = pubkey;
	} else if (Bitcoin.Util.isArray(pubkey)) {
	    Q = _ECPointFp.decodeFrom(this.ecparams['curve'], pubkey);
	} else {
	    throw "Invalid format for pubkey value, must be byte array or ECPointFp";
	}
	var e = _BigInteger.fromByteArrayUnsigned(hash);

	return this.verifyRaw(e, r, s, Q);
    };

    this.verifyRaw = function (e, r, s, Q) {
	var n = this.ecparams['n'];
	var G = this.ecparams['G'];

	if (r.compareTo(_BigInteger.ONE) < 0 ||
	    r.compareTo(n) >= 0)
	    return false;

	if (s.compareTo(_BigInteger.ONE) < 0 ||
	    s.compareTo(n) >= 0)
	    return false;

	var c = s.modInverse(n);

	var u1 = e.multiply(c).mod(n);
	var u2 = r.multiply(c).mod(n);

	// TODO(!!!): For some reason Shamir's trick isn't working with
	// signed message verification!? Probably an implementation
	// error!
	//var point = implShamirsTrick(G, u1, Q, u2);
	var point = G.multiply(u1).add(Q.multiply(u2));

	var v = point.getX().toBigInteger().mod(n);

	return v.equals(r);
    };

    /**
     * Serialize a signature into DER format.
     *
     * Takes two BigIntegers representing r and s and returns a byte array.
     */
    this.serializeSig = function (r, s) {
	var rBa = r.toByteArraySigned();
	var sBa = s.toByteArraySigned();

	var sequence = [];
	sequence.push(0x02); // INTEGER
	sequence.push(rBa.length);
	sequence = sequence.concat(rBa);

	sequence.push(0x02); // INTEGER
	sequence.push(sBa.length);
	sequence = sequence.concat(sBa);

	sequence.unshift(sequence.length);
	sequence.unshift(0x30); // SEQUENCE
	return sequence;
    };

    /**
     * Parses a byte array containing a DER-encoded signature.
     *
     * This function will return an object of the form:
     *
     * {
     *   r: BigInteger,
     *   s: BigInteger
     * }
     */
    this.parseSig = function (sig) {
	var cursor;
	if (sig[0] != 0x30)
	    throw new Error("Signature not a valid DERSequence");

	cursor = 2;
	if (sig[cursor] != 0x02)
	    throw new Error("First element in signature must be a DERInteger");;
	var rBa = sig.slice(cursor+2, cursor+2+sig[cursor+1]);

	cursor += 2+sig[cursor+1];
	if (sig[cursor] != 0x02)
	    throw new Error("Second element in signature must be a DERInteger");
	var sBa = sig.slice(cursor+2, cursor+2+sig[cursor+1]);

	cursor += 2+sig[cursor+1];

	//if (cursor != sig.length)
	//  throw new Error("Extra bytes in signature");

	var r = _BigInteger.fromByteArrayUnsigned(rBa);
	var s = _BigInteger.fromByteArrayUnsigned(sBa);

	return {r: r, s: s};
    };

    this.parseSigCompact = function (sig) {
	if (sig.length !== 65) {
	    throw "Signature has the wrong length";
	}

	// Signature is prefixed with a type byte storing three bits of
	// information.
	var i = sig[0] - 27;
	if (i < 0 || i > 7) {
	    throw "Invalid signature type";
	}

	var n = this.ecparams['n'];
	var r = _BigInteger.fromByteArrayUnsigned(sig.slice(1, 33)).mod(n);
	var s = _BigInteger.fromByteArrayUnsigned(sig.slice(33, 65)).mod(n);

	return {r: r, s: s, i: i};
    };

    /**
     * read an ASN.1 hexadecimal string of PKCS#1/5 plain ECC private key<br/>
     * @name readPKCS5PrvKeyHex
     * @memberOf KJUR.crypto.ECDSA#
     * @function
     * @param {String} h hexadecimal string of PKCS#1/5 ECC private key
     * @since jsrsasign 7.1.0 ecdsa-modified 1.1.0
     */
    this.readPKCS5PrvKeyHex = function(h) {
	if (_isASN1HEX(h) === false)
	    throw new Error("not ASN.1 hex string");

	var hCurve, hPrv, hPub;
	try {
	    hCurve = _getVbyListEx(h, 0, ["[0]", 0], "06");
	    hPrv   = _getVbyListEx(h, 0, [1], "04");
	    try {
		hPub = _getVbyListEx(h, 0, ["[1]", 0], "03");
	    } catch(ex) {};
	} catch(ex) {
	    throw new Error("malformed PKCS#1/5 plain ECC private key");
	}

	this.curveName = _getName(hCurve);
	if (this.curveName === undefined) throw "unsupported curve name";

	this.setNamedCurve(this.curveName);
	this.setPublicKeyHex(hPub);
	this.setPrivateKeyHex(hPrv);
        this.isPublic = false;
    };

    /**
     * read an ASN.1 hexadecimal string of PKCS#8 plain ECC private key<br/>
     * @name readPKCS8PrvKeyHex
     * @memberOf KJUR.crypto.ECDSA#
     * @function
     * @param {String} h hexadecimal string of PKCS#8 ECC private key
     * @since jsrsasign 7.1.0 ecdsa-modified 1.1.0
     */
    this.readPKCS8PrvKeyHex = function(h) {
	if (_isASN1HEX(h) === false)
	    throw new _Error("not ASN.1 hex string");

	var hECOID, hCurve, hPrv, hPub;
	try {
	    hECOID = _getVbyListEx(h, 0, [1, 0], "06");
	    hCurve = _getVbyListEx(h, 0, [1, 1], "06");
	    hPrv   = _getVbyListEx(h, 0, [2, 0, 1], "04");
	    try {
		hPub = _getVbyListEx(h, 0, [2, 0, "[1]", 0], "03"); //.substr(2);
	    } catch(ex) {};
	} catch(ex) {
	    throw new _Error("malformed PKCS#8 plain ECC private key");
	}

	this.curveName = _getName(hCurve);
	if (this.curveName === undefined)
	    throw new _Error("unsupported curve name");

	this.setNamedCurve(this.curveName);
	this.setPublicKeyHex(hPub);
	this.setPrivateKeyHex(hPrv);
        this.isPublic = false;
    };

    /**
     * read an ASN.1 hexadecimal string of PKCS#8 ECC public key<br/>
     * @name readPKCS8PubKeyHex
     * @memberOf KJUR.crypto.ECDSA#
     * @function
     * @param {String} h hexadecimal string of PKCS#8 ECC public key
     * @since jsrsasign 7.1.0 ecdsa-modified 1.1.0
     */
    this.readPKCS8PubKeyHex = function(h) {
	if (_isASN1HEX(h) === false)
	    throw new _Error("not ASN.1 hex string");

	var hECOID, hCurve, hPub;
	try {
	    hECOID = _getVbyListEx(h, 0, [0, 0], "06");
	    hCurve = _getVbyListEx(h, 0, [0, 1], "06");
	    hPub = _getVbyListEx(h, 0, [1], "03"); //.substr(2); 
	} catch(ex) {
	    throw new _Error("malformed PKCS#8 ECC public key");
	}

	this.curveName = _getName(hCurve);
	if (this.curveName === null)
	    throw new _Error("unsupported curve name");

	this.setNamedCurve(this.curveName);
	this.setPublicKeyHex(hPub);
    };

    /**
     * read an ASN.1 hexadecimal string of X.509 ECC public key certificate<br/>
     * @name readCertPubKeyHex
     * @memberOf KJUR.crypto.ECDSA#
     * @function
     * @param {String} h hexadecimal string of X.509 ECC public key certificate
     * @param {Integer} nthPKI nth index of publicKeyInfo. (DEFAULT: 6 for X509v3)
     * @since jsrsasign 7.1.0 ecdsa-modified 1.1.0
     */
    this.readCertPubKeyHex = function(h, nthPKI) {
	if (_isASN1HEX(h) === false)
	    throw new _Error("not ASN.1 hex string");

	var hCurve, hPub;
	try {
	    hCurve = _getVbyListEx(h, 0, [0, 5, 0, 1], "06");
	    hPub = _getVbyListEx(h, 0, [0, 5, 1], "03");
	} catch(ex) {
	    throw new _Error("malformed X.509 certificate ECC public key");
	}

	this.curveName = _getName(hCurve);
	if (this.curveName === null)
	    throw new _Error("unsupported curve name");

	this.setNamedCurve(this.curveName);
	this.setPublicKeyHex(hPub);
    };

    /*
     * Recover a public key from a signature.
     *
     * See SEC 1: Elliptic Curve Cryptography, section 4.1.6, "Public
     * Key Recovery Operation".
     *
     * http://www.secg.org/download/aid-780/sec1-v2.pdf
     */
    /*
    recoverPubKey: function (r, s, hash, i) {
	// The recovery parameter i has two bits.
	i = i & 3;

	// The less significant bit specifies whether the y coordinate
	// of the compressed point is even or not.
	var isYEven = i & 1;

	// The more significant bit specifies whether we should use the
	// first or second candidate key.
	var isSecondKey = i >> 1;

	var n = this.ecparams['n'];
	var G = this.ecparams['G'];
	var curve = this.ecparams['curve'];
	var p = curve.getQ();
	var a = curve.getA().toBigInteger();
	var b = curve.getB().toBigInteger();

	// We precalculate (p + 1) / 4 where p is if the field order
	if (!P_OVER_FOUR) {
	    P_OVER_FOUR = p.add(BigInteger.ONE).divide(BigInteger.valueOf(4));
	}

	// 1.1 Compute x
	var x = isSecondKey ? r.add(n) : r;

	// 1.3 Convert x to point
	var alpha = x.multiply(x).multiply(x).add(a.multiply(x)).add(b).mod(p);
	var beta = alpha.modPow(P_OVER_FOUR, p);

	var xorOdd = beta.isEven() ? (i % 2) : ((i+1) % 2);
	// If beta is even, but y isn't or vice versa, then convert it,
	// otherwise we're done and y == beta.
	var y = (beta.isEven() ? !isYEven : isYEven) ? beta : p.subtract(beta);

	// 1.4 Check that nR is at infinity
	var R = new ECPointFp(curve,
			      curve.fromBigInteger(x),
			      curve.fromBigInteger(y));
	R.validate();

	// 1.5 Compute e from M
	var e = BigInteger.fromByteArrayUnsigned(hash);
	var eNeg = BigInteger.ZERO.subtract(e).mod(n);

	// 1.6 Compute Q = r^-1 (sR - eG)
	var rInv = r.modInverse(n);
	var Q = implShamirsTrick(R, s, G, eNeg).multiply(rInv);

	Q.validate();
	if (!this.verifyRaw(e, r, s, Q)) {
	    throw "Pubkey recovery unsuccessful";
	}

	var pubKey = new Bitcoin.ECKey();
	pubKey.pub = Q;
	return pubKey;
    },
    */

    /*
     * Calculate pubkey extraction parameter.
     *
     * When extracting a pubkey from a signature, we have to
     * distinguish four different cases. Rather than putting this
     * burden on the verifier, Bitcoin includes a 2-bit value with the
     * signature.
     *
     * This function simply tries all four cases and returns the value
     * that resulted in a successful pubkey recovery.
     */
    /*
    calcPubkeyRecoveryParam: function (address, r, s, hash) {
	for (var i = 0; i < 4; i++) {
	    try {
		var pubkey = Bitcoin.ECDSA.recoverPubKey(r, s, hash, i);
		if (pubkey.getBitcoinAddress().toString() == address) {
		    return i;
		}
	    } catch (e) {}
	}
	throw "Unable to find valid recovery factor";
    }
    */

    if (params !== undefined) {
	if (params['curve'] !== undefined) {
	    this.curveName = params['curve'];
	}
    }
    if (this.curveName === undefined) this.curveName = curveName;
    this.setNamedCurve(this.curveName);
    if (params !== undefined) {
	if (params.prv !== undefined) this.setPrivateKeyHex(params.prv);
	if (params.pub !== undefined) this.setPublicKeyHex(params.pub);
    }
};

/**
 * parse ASN.1 DER encoded ECDSA signature
 * @name parseSigHex
 * @memberOf KJUR.crypto.ECDSA
 * @function
 * @static
 * @param {String} sigHex hexadecimal string of ECDSA signature value
 * @return {Array} associative array of signature field r and s of BigInteger
 * @since ecdsa-modified 1.0.1
 * @see {@link KJUR.crypto.ECDSA.parseSigHexInHexRS}
 * @see {@link ASN1HEX.checkStrictDER}
 * @throws Error when signature value is malformed.
 * @example
 * var ec = new KJUR.crypto.ECDSA({'curve': 'secp256r1'});
 * var sig = ec.parseSigHex('30...');
 * var biR = sig.r; // BigInteger object for 'r' field of signature.
 * var biS = sig.s; // BigInteger object for 's' field of signature.
 */
KJUR.crypto.ECDSA.parseSigHex = function(sigHex) {
    var p = KJUR.crypto.ECDSA.parseSigHexInHexRS(sigHex);
    var biR = new BigInteger(p.r, 16);
    var biS = new BigInteger(p.s, 16);
    
    return {'r': biR, 's': biS};
};

/**
 * parse ASN.1 DER encoded ECDSA signature
 * @name parseSigHexInHexRS
 * @memberOf KJUR.crypto.ECDSA
 * @function
 * @static
 * @param {String} sigHex hexadecimal string of ECDSA signature value
 * @return {Array} associative array of signature field r and s in hexadecimal
 * @since ecdsa-modified 1.0.3
 * @see {@link KJUR.crypto.ECDSA.parseSigHex}
 * @see {@link ASN1HEX.checkStrictDER}
 * @throws Error when signature value is malformed.
 * @example
 * var ec = new KJUR.crypto.ECDSA({'curve': 'secp256r1'});
 * var sig = ec.parseSigHexInHexRS('30...');
 * var hR = sig.r; // hexadecimal string for 'r' field of signature.
 * var hS = sig.s; // hexadecimal string for 's' field of signature.
 */
KJUR.crypto.ECDSA.parseSigHexInHexRS = function(sigHex) {
    var _ASN1HEX = ASN1HEX,
	_getChildIdx = _ASN1HEX.getChildIdx,
	_getV = _ASN1HEX.getV;

    // 1. strict DER check
    _ASN1HEX.checkStrictDER(sigHex, 0);

    // 2. ASN.1 Sequence Check
    if (sigHex.substr(0, 2) != "30")
	throw new Error("signature is not a ASN.1 sequence");

    // 2. Items of ASN.1 Sequence Check
    var a = _getChildIdx(sigHex, 0);
    if (a.length != 2)
	throw new Error("signature shall have two elements");

    // 3. Integer tag check
    var iTLV1 = a[0];
    var iTLV2 = a[1];

    if (sigHex.substr(iTLV1, 2) != "02")
	throw new Error("1st item not ASN.1 integer");
    if (sigHex.substr(iTLV2, 2) != "02")
	throw new Error("2nd item not ASN.1 integer");

    // 4. getting value and least zero check for DER
    var hR = _getV(sigHex, iTLV1);
    var hS = _getV(sigHex, iTLV2);

    return {'r': hR, 's': hS};
};

/**
 * convert hexadecimal ASN.1 encoded signature to concatinated signature
 * @name asn1SigToConcatSig
 * @memberOf KJUR.crypto.ECDSA
 * @function
 * @static
 * @param {String} asn1Hex hexadecimal string of ASN.1 encoded ECDSA signature value
 * @return {String} r-s concatinated format of ECDSA signature value
 * @throws Error when signature length is unsupported
 * @since ecdsa-modified 1.0.3
 */
KJUR.crypto.ECDSA.asn1SigToConcatSig = function(asn1Sig) {
    var pSig = KJUR.crypto.ECDSA.parseSigHexInHexRS(asn1Sig);
    var hR = pSig.r;
    var hS = pSig.s;

	// P-521 special case (65-66 bytes are allowed)
	if (hR.length >= 130 && hR.length <= 134) {
		if (hR.length % 2 != 0) {
			throw Error("unknown ECDSA sig r length error");
		}
		if (hS.length % 2 != 0) {
			throw Error("unknown ECDSA sig s length error");
		}
		if (hR.substr(0, 2) == "00") hR = hR.substr(2);
		if (hS.substr(0, 2) == "00") hS = hS.substr(2);

		// make sure they have the same length
		var length = Math.max(hR.length, hS.length);
		hR = ("000000" + hR).slice(- length);
		hS = ("000000" + hS).slice(- length);

		return hR + hS;
	}

    // R and S length is assumed multiple of 128bit(32chars in hex).
    // If leading is "00" and modulo of length is 2(chars) then
    // leading "00" is for two's complement and will be removed.
    if (hR.substr(0, 2) == "00" && (hR.length % 32) == 2)
	hR = hR.substr(2);

    if (hS.substr(0, 2) == "00" && (hS.length % 32) == 2)
	hS = hS.substr(2);

    // R and S length is assumed multiple of 128bit(32chars in hex).
    // If missing two chars then it will be padded by "00".
    if ((hR.length % 32) == 30) hR = "00" + hR;
    if ((hS.length % 32) == 30) hS = "00" + hS;

    // If R and S length is not still multiple of 128bit(32 chars),
    // then error
    if (hR.length % 32 != 0)
	throw Error("unknown ECDSA sig r length error");
    if (hS.length % 32 != 0)
	throw Error("unknown ECDSA sig s length error");

    return hR + hS;
};

/**
 * convert hexadecimal concatinated signature to ASN.1 encoded signature
 * @name concatSigToASN1Sig
 * @memberOf KJUR.crypto.ECDSA
 * @function
 * @static
 * @param {String} concatSig r-s concatinated format of ECDSA signature value
 * @return {String} hexadecimal string of ASN.1 encoded ECDSA signature value
 * @throws Error when signature length is unsupported
 * @since ecdsa-modified 1.0.3
 */
KJUR.crypto.ECDSA.concatSigToASN1Sig = function(concatSig) {
	if (concatSig.length % 4 != 0) {
		throw Error("unknown ECDSA concatinated r-s sig length error");
	}

    var hR = concatSig.substr(0, concatSig.length / 2);
    var hS = concatSig.substr(concatSig.length / 2);
    return KJUR.crypto.ECDSA.hexRSSigToASN1Sig(hR, hS);
};

/**
 * convert hexadecimal R and S value of signature to ASN.1 encoded signature
 * @name hexRSSigToASN1Sig
 * @memberOf KJUR.crypto.ECDSA
 * @function
 * @static
 * @param {String} hR hexadecimal string of R field of ECDSA signature value
 * @param {String} hS hexadecimal string of S field of ECDSA signature value
 * @return {String} hexadecimal string of ASN.1 encoded ECDSA signature value
 * @since ecdsa-modified 1.0.3
 */
KJUR.crypto.ECDSA.hexRSSigToASN1Sig = function(hR, hS) {
    var biR = new BigInteger(hR, 16);
    var biS = new BigInteger(hS, 16);
    return KJUR.crypto.ECDSA.biRSSigToASN1Sig(biR, biS);
};

/**
 * convert R and S BigInteger object of signature to ASN.1 encoded signature
 * @name biRSSigToASN1Sig
 * @memberOf KJUR.crypto.ECDSA
 * @function
 * @static
 * @param {BigInteger} biR BigInteger object of R field of ECDSA signature value
 * @param {BigInteger} biS BIgInteger object of S field of ECDSA signature value
 * @return {String} hexadecimal string of ASN.1 encoded ECDSA signature value
 * @since ecdsa-modified 1.0.3
 */
KJUR.crypto.ECDSA.biRSSigToASN1Sig = function(biR, biS) {
    var _KJUR_asn1 = KJUR.asn1;
    var derR = new _KJUR_asn1.DERInteger({'bigint': biR});
    var derS = new _KJUR_asn1.DERInteger({'bigint': biS});
    var derSeq = new _KJUR_asn1.DERSequence({'array': [derR, derS]});
    return derSeq.tohex();
};

/**
 * static method to get normalized EC curve name from curve name or hexadecimal OID value
 * @name getName
 * @memberOf KJUR.crypto.ECDSA
 * @function
 * @static
 * @param {String} s curve name (ex. P-256) or hexadecimal OID value (ex. 2a86...)
 * @return {String} normalized EC curve name (ex. secp256r1) 
 * @since jsrsasign 7.1.0 ecdsa-modified 1.1.0 
 * @description
 * This static method returns normalized EC curve name 
 * which is supported in jsrsasign
 * from curve name or hexadecimal OID value.
 * When curve is not supported in jsrsasign, this method returns null.
 * Normalized name will be "secp*" in jsrsasign.
 * @example
 * KJUR.crypto.ECDSA.getName("2b8104000a") &rarr; "secp256k1"
 * KJUR.crypto.ECDSA.getName("NIST P-256") &rarr; "secp256r1"
 * KJUR.crypto.ECDSA.getName("P-521") &rarr; undefined // not supported
 */
KJUR.crypto.ECDSA.getName = function(s) {
    if (s === "2b8104001f") return "secp192k1"; // 1.3.132.0.31
    if (s === "2a8648ce3d030107") return "secp256r1"; // 1.2.840.10045.3.1.7
    if (s === "2b8104000a") return "secp256k1"; // 1.3.132.0.10
    if (s === "2b81040021") return "secp224r1"; // 1.3.132.0.33
    if (s === "2b81040022") return "secp384r1"; // 1.3.132.0.34
	if (s === "2b81040023") return "secp521r1"; // 1.3.132.0.35
    if ("|secp256r1|NIST P-256|P-256|prime256v1|".indexOf(s) !== -1) return "secp256r1";
    if ("|secp256k1|".indexOf(s) !== -1) return "secp256k1";
    if ("|secp224r1|NIST P-224|P-224|".indexOf(s) !== -1) return "secp224r1";
    if ("|secp384r1|NIST P-384|P-384|".indexOf(s) !== -1) return "secp384r1";
	if ("|secp521r1|NIST P-521|P-521|".indexOf(s) !== -1) return "secp521r1";
    return null;
};




/* ecparam-1.0.1.js (c) 2013-2021 Kenji Urushima | kjur.github.io/jsrsasign/license
 */
/*
 * ecparam.js - Elliptic Curve Cryptography Curve Parameter Definition class
 *
 * Copyright (c) 2013-2021 Kenji Urushima (kenji.urushima@gmail.com)
 *
 * This software is licensed under the terms of the MIT License.
 * https://kjur.github.io/jsrsasign/license
 *
 * The above copyright and license notice shall be 
 * included in all copies or substantial portions of the Software.
 */

/**
 * @fileOverview
 * @name ecparam-1.1.js
 * @author Kenji Urushima kenji.urushima@gmail.com
 * @version jsrsasign 10.5.0 ecparam 1.0.1 (2021-Nov-21)
 * @since jsrsasign 4.0
 * @license <a href="https://kjur.github.io/jsrsasign/license/">MIT License</a>
 */

if (typeof KJUR == "undefined" || !KJUR) KJUR = {};
if (typeof KJUR.crypto == "undefined" || !KJUR.crypto) KJUR.crypto = {};

/**
 * static object for elliptic curve names and parameters
 * @name KJUR.crypto.ECParameterDB
 * @class static object for elliptic curve names and parameters
 * @description
 * This class provides parameters for named elliptic curves.
 * Currently it supoprts following curve names and aliases however 
 * the name marked (*) are available for {@link KJUR.crypto.ECDSA} and
 * {@link KJUR.crypto.Signature} classes.
 * <ul>
 * <li>secp128r1</li>
 * <li>secp160r1</li>
 * <li>secp160k1</li>
 * <li>secp192r1</li>
 * <li>secp192k1</li>
 * <li>secp224r1</li>
 * <li>secp256r1, NIST P-256, P-256, prime256v1 (*)</li>
 * <li>secp256k1 (*)</li>
 * <li>secp384r1, NIST P-384, P-384 (*)</li>
 * <li>secp521r1, NIST P-521, P-521</li>
 * </ul>
 * You can register new curves by using 'register' method.
 */
KJUR.crypto.ECParameterDB = new function() {
    var db = {};
    var aliasDB = {};

    function hex2bi(hex) {
        return new BigInteger(hex, 16);
    }
    
    /**
     * get curve inforamtion associative array for curve name or alias
     * @name getByName
     * @memberOf KJUR.crypto.ECParameterDB
     * @function
     * @param {String} nameOrAlias curve name or alias name
     * @return {Array} associative array of curve parameters
     * @example
     * var param = KJUR.crypto.ECParameterDB.getByName('prime256v1');
     * var keylen = param['keylen'];
     * var n = param['n'];
     */
    this.getByName = function(nameOrAlias) {
	var name = nameOrAlias;
	if (typeof aliasDB[name] != "undefined") {
	    name = aliasDB[nameOrAlias];
        }
	if (typeof db[name] != "undefined") {
	    return db[name];
	}
	throw "unregistered EC curve name: " + name;
    };

    /**
     * register new curve
     * @name regist
     * @memberOf KJUR.crypto.ECParameterDB
     * @function
     * @param {String} name name of curve
     * @param {Integer} keylen key length
     * @param {String} pHex hexadecimal value of p
     * @param {String} aHex hexadecimal value of a
     * @param {String} bHex hexadecimal value of b
     * @param {String} nHex hexadecimal value of n
     * @param {String} hHex hexadecimal value of h
     * @param {String} gxHex hexadecimal value of Gx
     * @param {String} gyHex hexadecimal value of Gy
     * @param {Array} aliasList array of string for curve names aliases
     * @param {String} oid Object Identifier for the curve
     * @param {String} info information string for the curve
     */
    this.regist = function(name, keylen, pHex, aHex, bHex, nHex, hHex, gxHex, gyHex, aliasList, oid, info) {
        db[name] = {};
	var p = hex2bi(pHex);
	var a = hex2bi(aHex);
	var b = hex2bi(bHex);
	var n = hex2bi(nHex);
	var h = hex2bi(hHex);
        var curve = new ECCurveFp(p, a, b);
        var G = curve.decodePointHex("04" + gxHex + gyHex);
	db[name]['name'] = name;
	db[name]['keylen'] = keylen;
  db[name]['keycharlen'] = Math.ceil(keylen / 8) * 2; // for P-521
        db[name]['curve'] = curve;
        db[name]['G'] = G;
        db[name]['n'] = n;
        db[name]['h'] = h;
        db[name]['oid'] = oid;
        db[name]['info'] = info;

        for (var i = 0; i < aliasList.length; i++) {
	    aliasDB[aliasList[i]] = name;
        }
    };
};

KJUR.crypto.ECParameterDB.regist(
  "secp128r1", // name / p = 2^128 - 2^97 - 1
  128,
  "FFFFFFFDFFFFFFFFFFFFFFFFFFFFFFFF", // p
  "FFFFFFFDFFFFFFFFFFFFFFFFFFFFFFFC", // a
  "E87579C11079F43DD824993C2CEE5ED3", // b
  "FFFFFFFE0000000075A30D1B9038A115", // n
  "1", // h
  "161FF7528B899B2D0C28607CA52C5B86", // gx
  "CF5AC8395BAFEB13C02DA292DDED7A83", // gy
  [], // alias
  "", // oid (underconstruction)
  "secp128r1 : SECG curve over a 128 bit prime field"); // info

KJUR.crypto.ECParameterDB.regist(
  "secp160k1", // name / p = 2^160 - 2^32 - 2^14 - 2^12 - 2^9 - 2^8 - 2^7 - 2^3 - 2^2 - 1
  160,
  "FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEFFFFAC73", // p
  "0", // a
  "7", // b
  "0100000000000000000001B8FA16DFAB9ACA16B6B3", // n
  "1", // h
  "3B4C382CE37AA192A4019E763036F4F5DD4D7EBB", // gx
  "938CF935318FDCED6BC28286531733C3F03C4FEE", // gy
  [], // alias
  "", // oid
  "secp160k1 : SECG curve over a 160 bit prime field"); // info

KJUR.crypto.ECParameterDB.regist(
  "secp160r1", // name / p = 2^160 - 2^31 - 1
  160,
  "FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF7FFFFFFF", // p
  "FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF7FFFFFFC", // a
  "1C97BEFC54BD7A8B65ACF89F81D4D4ADC565FA45", // b
  "0100000000000000000001F4C8F927AED3CA752257", // n
  "1", // h
  "4A96B5688EF573284664698968C38BB913CBFC82", // gx
  "23A628553168947D59DCC912042351377AC5FB32", // gy
  [], // alias
  "", // oid
  "secp160r1 : SECG curve over a 160 bit prime field"); // info

KJUR.crypto.ECParameterDB.regist(
  "secp192k1", // name / p = 2^192 - 2^32 - 2^12 - 2^8 - 2^7 - 2^6 - 2^3 - 1
  192,
  "FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEFFFFEE37", // p
  "0", // a
  "3", // b
  "FFFFFFFFFFFFFFFFFFFFFFFE26F2FC170F69466A74DEFD8D", // n
  "1", // h
  "DB4FF10EC057E9AE26B07D0280B7F4341DA5D1B1EAE06C7D", // gx
  "9B2F2F6D9C5628A7844163D015BE86344082AA88D95E2F9D", // gy
  []); // alias

KJUR.crypto.ECParameterDB.regist(
  "secp192r1", // name / p = 2^192 - 2^64 - 1
  192,
  "FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEFFFFFFFFFFFFFFFF", // p
  "FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEFFFFFFFFFFFFFFFC", // a
  "64210519E59C80E70FA7E9AB72243049FEB8DEECC146B9B1", // b
  "FFFFFFFFFFFFFFFFFFFFFFFF99DEF836146BC9B1B4D22831", // n
  "1", // h
  "188DA80EB03090F67CBF20EB43A18800F4FF0AFD82FF1012", // gx
  "07192B95FFC8DA78631011ED6B24CDD573F977A11E794811", // gy
  []); // alias

KJUR.crypto.ECParameterDB.regist(
  "secp224r1", // name / p = 2^224 - 2^96 + 1
  224,
  "FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF000000000000000000000001", // p
  "FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEFFFFFFFFFFFFFFFFFFFFFFFE", // a
  "B4050A850C04B3ABF54132565044B0B7D7BFD8BA270B39432355FFB4", // b
  "FFFFFFFFFFFFFFFFFFFFFFFFFFFF16A2E0B8F03E13DD29455C5C2A3D", // n
  "1", // h
  "B70E0CBD6BB4BF7F321390B94A03C1D356C21122343280D6115C1D21", // gx
  "BD376388B5F723FB4C22DFE6CD4375A05A07476444D5819985007E34", // gy
  []); // alias

KJUR.crypto.ECParameterDB.regist(
  "secp256k1", // name / p = 2^256 - 2^32 - 2^9 - 2^8 - 2^7 - 2^6 - 2^4 - 1
  256,
  "FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEFFFFFC2F", // p
  "0", // a
  "7", // b
  "FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEBAAEDCE6AF48A03BBFD25E8CD0364141", // n
  "1", // h
  "79BE667EF9DCBBAC55A06295CE870B07029BFCDB2DCE28D959F2815B16F81798", // gx
  "483ADA7726A3C4655DA4FBFC0E1108A8FD17B448A68554199C47D08FFB10D4B8", // gy
  []); // alias

KJUR.crypto.ECParameterDB.regist(
  "secp256r1", // name / p = 2^224 (2^32 - 1) + 2^192 + 2^96 - 1
  256,
  "FFFFFFFF00000001000000000000000000000000FFFFFFFFFFFFFFFFFFFFFFFF", // p
  "FFFFFFFF00000001000000000000000000000000FFFFFFFFFFFFFFFFFFFFFFFC", // a
  "5AC635D8AA3A93E7B3EBBD55769886BC651D06B0CC53B0F63BCE3C3E27D2604B", // b
  "FFFFFFFF00000000FFFFFFFFFFFFFFFFBCE6FAADA7179E84F3B9CAC2FC632551", // n
  "1", // h
  "6B17D1F2E12C4247F8BCE6E563A440F277037D812DEB33A0F4A13945D898C296", // gx
  "4FE342E2FE1A7F9B8EE7EB4A7C0F9E162BCE33576B315ECECBB6406837BF51F5", // gy
  ["NIST P-256", "P-256", "prime256v1"]); // alias

KJUR.crypto.ECParameterDB.regist(
  "secp384r1", // name
  384,
  "FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEFFFFFFFF0000000000000000FFFFFFFF", // p
  "FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEFFFFFFFF0000000000000000FFFFFFFC", // a
  "B3312FA7E23EE7E4988E056BE3F82D19181D9C6EFE8141120314088F5013875AC656398D8A2ED19D2A85C8EDD3EC2AEF", // b
  "FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFC7634D81F4372DDF581A0DB248B0A77AECEC196ACCC52973", // n
  "1", // h
  "AA87CA22BE8B05378EB1C71EF320AD746E1D3B628BA79B9859F741E082542A385502F25DBF55296C3A545E3872760AB7", // gx
  "3617de4a96262c6f5d9e98bf9292dc29f8f41dbd289a147ce9da3113b5f0b8c00a60b1ce1d7e819d7a431d7c90ea0e5f", // gy
  ["NIST P-384", "P-384"]); // alias

KJUR.crypto.ECParameterDB.regist(
  "secp521r1", // name
  521,
  "1FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF", // p
  "1FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFC", // a
  "051953EB9618E1C9A1F929A21A0B68540EEA2DA725B99B315F3B8B489918EF109E156193951EC7E937B1652C0BD3BB1BF073573DF883D2C34F1EF451FD46B503F00", // b
  "1FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFA51868783BF2F966B7FCC0148F709A5D03BB5C9B8899C47AEBB6FB71E91386409", // n
  "1", // h
  "00C6858E06B70404E9CD9E3ECB662395B4429C648139053FB521F828AF606B4D3DBAA14B5E77EFE75928FE1DC127A2FFA8DE3348B3C1856A429BF97E7E31C2E5BD66", // gx
  "011839296a789a3bc0045c8a5fb42c7d1bd998f54449579b446817afbd17273e662c97ee72995ef42640c550b9013fad0761353c7086a272c24088be94769fd16650", // gy
  ["NIST P-521", "P-521"]); // alias


exports.crypto = KJUR.crypto;

